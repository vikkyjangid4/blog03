<?php
// Enable error reporting for debugging
error_reporting(E_ALL);
ini_set('display_errors', 1);
ini_set('log_errors', 1);
ini_set('error_log', '/tmp/php_errors.log');

require_once 'config.php';
require_once 'auth.php';

// Check admin authentication
requireAdminAuth();

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Check if image file was uploaded
    if (!isset($_FILES['image']) || $_FILES['image']['error'] !== UPLOAD_ERR_OK) {
        http_response_code(400);
        echo json_encode(['error' => 'No image file uploaded or upload error occurred']);
        exit;
    }

    $image = $_FILES['image'];
    
    // Validate file size (max 5MB)
    $maxFileSize = 5 * 1024 * 1024;
    if ($image['size'] > $maxFileSize) {
        http_response_code(400);
        echo json_encode(['error' => 'Image size exceeds 5MB limit']);
        exit;
    }

    // Validate file type
    $allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    $finfo = finfo_open(FILEINFO_MIME_TYPE);
    $mimeType = finfo_file($finfo, $image['tmp_name']);
    finfo_close($finfo);

    if (!in_array($mimeType, $allowedTypes)) {
        http_response_code(400);
        echo json_encode(['error' => 'Invalid file type. Only JPG, PNG, GIF, and WebP are allowed.']);
        exit;
    }

    // Create upload directory if it doesn't exist
    $uploadDir = __DIR__ . '/../uploads/editor';
    if (!file_exists($uploadDir)) {
        mkdir($uploadDir, 0755, true);
    }

    // Generate unique filename
    $extension = pathinfo($image['name'], PATHINFO_EXTENSION);
    $uniqueSuffix = uniqid('editor_', true) . '_' . time();
    $filename = $uniqueSuffix . '.' . $extension;
    $filepath = $uploadDir . '/' . $filename;

    // Move uploaded file
    if (!move_uploaded_file($image['tmp_name'], $filepath)) {
        http_response_code(500);
        echo json_encode(['error' => 'Failed to save uploaded image']);
        exit;
    }

    // Return success response with image URL
    $imageUrl = '/uploads/editor/' . $filename;
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'url' => $imageUrl,
        'filename' => $filename,
        'size' => $image['size'],
        'mimetype' => $mimeType
    ]);

} catch (Exception $e) {
    error_log('Image upload error: ' . $e->getMessage());
    http_response_code(500);
    echo json_encode([
        'error' => 'Failed to upload image',
        'message' => $e->getMessage()
    ]);
}
?>
