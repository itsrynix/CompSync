use compsync_network::protocol::{HelloMessage, Message};
use compsync_network::staging::StagingFile;
use tempfile::tempdir;
use uuid::Uuid;

#[test]
fn test_protocol_message_roundtrip() {
    let hello = Message::Hello(HelloMessage {
        device_id: "desktop-win".into(),
        device_name: "Desktop".into(),
        project_id: Uuid::new_v4(),
        head_snapshot_id: Some("snapshot-1234".into()),
        is_locked: false,
    });

    let encoded = hello.encode().expect("encoding failed");
    let decoded = Message::decode(&encoded).expect("decoding failed");

    match (hello, decoded) {
        (Message::Hello(a), Message::Hello(b)) => {
            assert_eq!(a, b);
        }
        _ => panic!("Type mismatch"),
    }
}

#[test]
fn test_staging_chunk_write_and_verify() {
    let dir = tempdir().unwrap();
    let file_hash = "mock_file_hash_123";
    let data = b"This is simulated 64MB chunk content for video footage transfer";
    let chunk_hash = compsync_core::blake3_hasher::hash_bytes(data);

    let mut staging = StagingFile::open_or_create(dir.path(), file_hash, data.len() as u64, 1)
        .expect("failed to open staging");

    assert_eq!(staging.get_missing_chunks(), vec![0]);
    assert!(!staging.is_complete());

    // Test writing chunk with valid hash
    let success = staging
        .write_chunk(0, 0, data, &chunk_hash)
        .expect("write failed");
    assert!(success);

    assert!(staging.is_complete());
    assert!(staging.is_chunk_completed(0));
    assert_eq!(staging.get_missing_chunks().len(), 0);

    // Finalize to dest
    let dest_path = dir.path().join("final_footage.mov");
    let finalize_ok = staging
        .finalize(&dest_path, &chunk_hash)
        .expect("finalize failed");
    assert!(finalize_ok);
    assert!(dest_path.exists());
}
