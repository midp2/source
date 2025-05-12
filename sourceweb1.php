<?php
session_start();

// Konfigurasi keamanan
$valid_username = 'admin'; // Ganti dengan username admin Anda
$valid_password = 'passwordsecure123'; // Ganti dengan password admin Anda

// Fungsi untuk memvalidasi login
function validateLogin($username, $password) {
    global $valid_username, $valid_password;
    return ($username === $valid_username && $password === $valid_password);
}

// Fungsi untuk mendapatkan daftar file
function getFileList($directory) {
    $files = [];
    $iterator = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($directory, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::SELF_FIRST
    );
    
    foreach ($iterator as $file) {
        if ($file->isFile()) {
            $files[] = $file->getPathname();
        }
    }
    return $files;
}

// Proses logout
if (isset($_GET['logout'])) {
    session_destroy();
    header('Location: ' . $_SERVER['PHP_SELF']);
    exit();
}

// Proses login
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['username']) && isset($_POST['password'])) {
    $username = $_POST['username'];
    $password = $_POST['password'];
    
    if (validateLogin($username, $password)) {
        $_SESSION['logged_in'] = true;
    } else {
        $error_message = "Username atau password salah!";
    }
}

// Cek otentikasi
if (!isset($_SESSION['logged_in']) || $_SESSION['logged_in'] !== true) {
    ?>
    <!DOCTYPE html>
    <html>
    <head>
        <title>Login - Source Website Editor</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 400px; margin: 0 auto; padding: 20px; }
            input { width: 100%; padding: 10px; margin: 10px 0; }
            .error { color: red; }
        </style>
    </head>
    <body>
        <h2>Login Source Website Editor</h2>
        <?php if (isset($error_message)): ?>
            <p class="error"><?php echo $error_message; ?></p>
        <?php endif; ?>
        <form method="POST">
            <input type="text" name="username" placeholder="Username" required><br>
            <input type="password" name="password" placeholder="Password" required><br>
            <input type="submit" value="Login">
        </form>
    </body>
    </html>
    <?php
    exit();
}

// Direktori root untuk edit
$base_directory = $_SERVER['DOCUMENT_ROOT'];

// Proses edit file
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['file_path']) && isset($_POST['file_content'])) {
    $file_path = $_POST['file_path'];
    $file_content = $_POST['file_content'];
    
    // Validasi path file
    if (strpos(realpath($file_path), $base_directory) === 0) {
        if (file_put_contents($file_path, $file_content) !== false) {
            $success_message = "File berhasil diperbarui!";
        } else {
            $error_message = "Gagal memperbarui file!";
        }
    } else {
        $error_message = "Akses file tidak diizinkan!";
    }
}

// Proses baca file
$selected_file = '';
$file_content = '';
if (isset($_GET['file'])) {
    $selected_file = $_GET['file'];
    
    // Validasi path file
    if (strpos(realpath($selected_file), $base_directory) === 0) {
        $file_content = file_get_contents($selected_file);
    } else {
        $error_message = "Akses file tidak diizinkan!";
    }
}
?>

<!DOCTYPE html>
<html>
<head>
    <title>Source Website Editor</title>
    <style>
        body { font-family: Arial, sans-serif; max-width: 1200px; margin: 0 auto; padding: 20px; }
        .container { display: flex; }
        .file-list { width: 30%; padding-right: 20px; overflow-y: auto; max-height: 700px; }
        .file-editor { width: 70%; }
        textarea { width: 100%; height: 500px; }
        .message { padding: 10px; margin-bottom: 10px; }
        .success { background-color: #dff0d8; color: #3c763d; }
        .error { background-color: #f2dede; color: #a94442; }
    </style>
</head>
<body>
    <h1>Source Website Editor</h1>
    <a href="?logout=1">Logout</a>
    
    <?php if (isset($success_message)): ?>
        <div class="message success"><?php echo $success_message; ?></div>
    <?php endif; ?>
    
    <?php if (isset($error_message)): ?>
        <div class="message error"><?php echo $error_message; ?></div>
    <?php endif; ?>
    
    <div class="container">
        <div class="file-list">
            <h3>Daftar File</h3>
            <?php 
            $files = getFileList($base_directory);
            foreach ($files as $file): 
                $display_path = str_replace($base_directory, '', $file);
            ?>
                <div>
                    <a href="?file=<?php echo urlencode($file); ?>">
                        <?php echo htmlspecialchars($display_path); ?>
                    </a>
                </div>
            <?php endforeach; ?>
        </div>
        
        <div class="file-editor">
            <?php if ($selected_file): ?>
                <h3>Edit File: <?php echo htmlspecialchars($selected_file); ?></h3>
                <form method="POST">
                    <input type="hidden" name="file_path" value="<?php echo htmlspecialchars($selected_file); ?>">
                    <textarea name="file_content"><?php echo htmlspecialchars($file_content); ?></textarea>
                    <br>
                    <input type="submit" value="Simpan Perubahan">
                </form>
            <?php else: ?>
                <p>Pilih file untuk diedit</p>
            <?php endif; ?>
        </div>
    </div>
</body>
</html>