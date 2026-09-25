use ignore::gitignore::{Gitignore, GitignoreBuilder};
use std::path::Path;

pub const DEFAULT_IGNORE_PATTERNS: &[&str] = &[
    ".compsync",
    ".compsync/**",
    "*After Effects Disk Cache*",
    "*After Effects Disk Cache*/**",
    "Adobe After Effects Auto-Save",
    "Adobe After Effects Auto-Save/**",
    "*.adobecache",
    "*.aecache",
    "*.cache",
    "*Adobe Premiere Pro Audio Previews*",
    "*Adobe Premiere Pro Video Previews*",
    "*.pek",
    "*.cfa",
    "Thumbs.db",
    "ehthumbs.db",
    "Desktop.ini",
    ".DS_Store",
    "._*",
    ".Spotlight-V100",
    ".Trashes",
    "*.part",
    "*.tmp",
    "*.lock",
];

pub struct IgnoreFilter {
    matcher: Gitignore,
}

impl IgnoreFilter {
    /// Create an IgnoreFilter with default Adobe/OS rules and optional .compsyncignore file
    pub fn new(root_dir: &Path) -> Self {
        let mut builder = GitignoreBuilder::new(root_dir);

        // Add built-in defaults
        for pattern in DEFAULT_IGNORE_PATTERNS {
            let _ = builder.add_line(None, pattern);
        }

        // Add custom .compsyncignore if it exists
        let custom_ignore_path = root_dir.join(".compsyncignore");
        if custom_ignore_path.exists() {
            let _ = builder.add(&custom_ignore_path);
        }

        let matcher = builder.build().unwrap_or_else(|_| Gitignore::empty());

        Self { matcher }
    }

    /// Check if a path should be ignored
    pub fn is_ignored(&self, path: &Path, is_dir: bool) -> bool {
        self.matcher.matched(path, is_dir).is_ignore()
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    #[test]
    fn test_default_ae_ignore_rules() {
        let dir = tempdir().unwrap();
        let filter = IgnoreFilter::new(dir.path());

        assert!(filter.is_ignored(Path::new("Adobe After Effects Auto-Save"), true));
        assert!(filter.is_ignored(Path::new("Adobe After Effects Auto-Save/auto1.aep"), false));
        assert!(filter.is_ignored(Path::new("Project After Effects Disk Cache/cache.dat"), false));
        assert!(filter.is_ignored(Path::new("footage/preview.cfa"), false));
        assert!(filter.is_ignored(Path::new(".compsync/index.db"), false));
        assert!(filter.is_ignored(Path::new("Thumbs.db"), false));

        // Normal files should NOT be ignored
        assert!(!filter.is_ignored(Path::new("MainProject.aep"), false));
        assert!(!filter.is_ignored(Path::new("Footage/Interview.mov"), false));
    }
}
