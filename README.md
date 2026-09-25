# CompSync

CompSync is a Windows desktop tool for versioning and synchronizing Adobe After Effects project folders over a local network. It keeps project metadata in a hidden `.compsync` directory, uses BLAKE3 hashes for file identity, and transfers large files in verified chunks.

## What It Does

- Scan an After Effects project folder and cache file hashes in SQLite.
- Create local, portable snapshot manifests.
- Pair a second computer with a project code.
- Discover paired computers over LAN using UDP.
- Receive snapshot files over TCP with chunk verification and resumable staging.
- Detect locked `.aep` files on Windows.
- Show transfer percentage, current file, and transfer speed during sync.

The current beta focuses on one-way receive/sync from a peer. A full bidirectional push and conflict-resolution workflow is not implemented yet.

## Install

Download the Windows installer from the GitHub Releases page. The NSIS installer is the simplest option:

```text
CompSync_0.1.0_x64-setup.exe
```

Install the same version on both computers. Windows may ask for permission to allow CompSync through the Private network firewall.

## Pair Two Computers

### On the primary computer

1. Open the project folder in CompSync.
2. If it is new, choose **Create New Project**.
3. Open the key icon in the top bar.
4. Copy the pairing code.

### On the second computer

1. Open the local project folder, or choose a new empty folder.
2. Open the project dropdown in the top-left corner.
3. Choose **Join Existing Project...**.
4. Paste the pairing code and select the local folder.

Pairing only shares the project identity. It does not copy files by itself.

## Sync Workflow

1. Save and close the project in After Effects before transferring it.
2. On the primary computer, run **Scan**.
3. Create a new Snapshot.
4. On the second computer, wait for the paired peer to appear.
5. Choose the peer and select **Pull Latest**.
6. Watch the transfer panel for the current file, percentage, speed, and errors.

The receiver stages files under `.compsync/staging` and verifies both each chunk and the complete file before moving it into the project folder.

## LAN Requirements

Both computers must be on the same local network and use the same project pairing code.

- UDP discovery: port `52425`.
- TCP file transfer: port `52424`.
- Allow `compsync_desktop.exe` through Windows Firewall on the Private network.
- Disable VPN or network isolation while testing.
- If a transfer was interrupted, close CompSync and remove only the contents of `.compsync/staging` before retrying.

## Development

### Requirements

- Rust stable and Cargo.
- Node.js and npm.
- Windows build tools for Tauri.
- Tauri CLI 2.x.

### Run frontend checks

```powershell
Set-Location frontend
npm ci
npm run build
```

### Check and test Rust

```powershell
cargo check --workspace
cargo test --workspace
```

### Build Windows installer

```powershell
cargo tauri build
```

The installer files are written to:

```text
target/release/bundle/msi/
target/release/bundle/nsis/
```

## Project Layout

```text
crates/compsync_core       Scanner, BLAKE3 hashing, SQLite index, manifests
crates/compsync_network    LAN discovery, protocol, staging, sync engine
crates/compsync_watcher    Windows file-lock detection
crates/compsync_cli        Command-line operations
frontend                   React, TypeScript, Vite UI
src-tauri                  Tauri desktop integration and commands
```

## Current Limitations

- Sync is currently peer-to-peer receive/pull oriented; bidirectional push is planned.
- Conflict preview, merge, rollback, and branch/head management are not implemented.
- Project pairing requires both computers to be reachable on the same LAN after pairing.
- Large project scans can take time because files must be hashed before creating a snapshot.

## License

MIT OR Apache-2.0
