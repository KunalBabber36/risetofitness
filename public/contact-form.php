<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Get form fields
    $name = $_POST['name'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $message = $_POST['message'];

    // Prepare the email
    $to = "your-email@example.com"; // Replace with your email address
    $subject = "New Contact Form Submission";
    $emailContent = "Name: $name\nEmail: $email\nPhone: $phone\nMessage:\n$message";

    // Send email
    $headers = "From: $email";

    if (mail($to, $subject, $emailContent, $headers)) {
        echo "Form submitted successfully! We will contact you shortly.";
    } else {
        echo "Error in sending email. Please try again later.";
    }
} else {
    echo "Invalid request.";
}
?>
