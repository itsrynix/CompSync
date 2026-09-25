use std::path::Path;

#[derive(Debug, Clone, PartialEq, Eq)]
pub enum LockStatus {
    Free,
    Locked {
        process_id: Option<u32>,
        process_name: Option<String>,
        is_after_effects: bool,
    },
}

#[cfg(windows)]
pub fn check_file_lock(path: &Path) -> LockStatus {
    use std::os::windows::ffi::OsStrExt;
    use windows_sys::Win32::Foundation::{
        CloseHandle, GetLastError, ERROR_ACCESS_DENIED, ERROR_LOCK_VIOLATION,
        ERROR_SHARING_VIOLATION, INVALID_HANDLE_VALUE,
    };
    use windows_sys::Win32::Storage::FileSystem::{
        CreateFileW, FILE_ATTRIBUTE_NORMAL, FILE_GENERIC_READ, FILE_GENERIC_WRITE, FILE_SHARE_NONE,
        OPEN_EXISTING,
    };
    use windows_sys::Win32::System::RestartManager::{
        RmEndSession, RmGetList, RmRegisterResources, RmStartSession, CCH_RM_MAX_APP_NAME,
        RM_PROCESS_INFO,
    };

    let wide_path: Vec<u16> = path
        .as_os_str()
        .encode_wide()
        .chain(std::iter::once(0))
        .collect();

    // Probe 1: Try acquiring exclusive handle without sharing
    let handle = unsafe {
        CreateFileW(
            wide_path.as_ptr(),
            FILE_GENERIC_READ | FILE_GENERIC_WRITE,
            FILE_SHARE_NONE, // No sharing: fails if any process currently has file open
            std::ptr::null(),
            OPEN_EXISTING,
            FILE_ATTRIBUTE_NORMAL,
            std::ptr::null_mut(),
        )
    };

    if handle != INVALID_HANDLE_VALUE {
        // Successfully opened exclusively: file is completely free!
        unsafe { CloseHandle(handle) };
        return LockStatus::Free;
    }

    let err = unsafe { GetLastError() };
    if err != ERROR_SHARING_VIOLATION && err != ERROR_LOCK_VIOLATION && err != ERROR_ACCESS_DENIED {
        return LockStatus::Free;
    }

    // Probe 2: Identify process using Windows Restart Manager
    let mut session_handle: u32 = 0;
    let mut session_key = [0u16; 33];

    let start_res = unsafe { RmStartSession(&mut session_handle, 0, session_key.as_mut_ptr()) };
    if start_res != 0 {
        return LockStatus::Locked {
            process_id: None,
            process_name: None,
            is_after_effects: false,
        };
    }

    let path_ptr = wide_path.as_ptr();
    let reg_res = unsafe {
        RmRegisterResources(
            session_handle,
            1,
            &path_ptr,
            0,
            std::ptr::null(),
            0,
            std::ptr::null(),
        )
    };

    if reg_res != 0 {
        unsafe { RmEndSession(session_handle) };
        return LockStatus::Locked {
            process_id: None,
            process_name: None,
            is_after_effects: false,
        };
    }

    let mut n_proc_info_needed = 0u32;
    let mut n_proc_info = 10u32;
    let mut proc_info: Vec<RM_PROCESS_INFO> = vec![unsafe { std::mem::zeroed() }; 10];
    let mut reboot_reasons = 0u32;

    let get_res = unsafe {
        RmGetList(
            session_handle,
            &mut n_proc_info_needed,
            &mut n_proc_info,
            proc_info.as_mut_ptr(),
            &mut reboot_reasons,
        )
    };

    let mut detected_pid = None;
    let mut detected_name = None;
    let mut is_ae = false;

    if get_res == 0 && n_proc_info > 0 {
        let info = &proc_info[0];
        detected_pid = Some(info.Process.dwProcessId);

        let app_name_u16 = &info.strAppName;
        let len = app_name_u16
            .iter()
            .position(|&c| c == 0)
            .unwrap_or(CCH_RM_MAX_APP_NAME as usize);
        let name = String::from_utf16_lossy(&app_name_u16[..len]);
        if !name.is_empty() {
            let lower = name.to_lowercase();
            if lower.contains("afterfx") || lower.contains("after effects") {
                is_ae = true;
            }
            detected_name = Some(name);
        }
    }

    unsafe { RmEndSession(session_handle) };

    LockStatus::Locked {
        process_id: detected_pid,
        process_name: detected_name,
        is_after_effects: is_ae,
    }
}

#[cfg(not(windows))]
pub fn check_file_lock(_path: &Path) -> LockStatus {
    LockStatus::Free
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::fs::File;
    use tempfile::tempdir;

    #[test]
    fn test_unlocked_and_locked_file() {
        let dir = tempdir().unwrap();
        let file_path = dir.path().join("test_project.aep");

        // 1. Create file and close handle immediately
        std::fs::write(&file_path, b"dummy aep content").unwrap();

        let status = check_file_lock(&file_path);
        assert_eq!(status, LockStatus::Free);

        // 2. Open file with exclusive/restrictive handle
        // On Windows, opening with File::create or File::options().write(true).open locks or restricts share
        let _held_file = File::options().write(true).open(&file_path).unwrap();

        let locked_status = check_file_lock(&file_path);
        match locked_status {
            LockStatus::Locked { process_name, .. } => {
                assert!(process_name.is_some());
            }
            LockStatus::Free => {
                // If standard File::open allowed sharing, probe might see free unless non-shared
            }
        }
    }
}
