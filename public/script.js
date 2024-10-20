// Simple authentication check
const ADMIN_PASSWORD = 'admin'; // Change this to something more secure
let isAuthenticated = false;

// Check for logged-in state
function checkAuthentication() {
    if (!isAuthenticated) {
        const password = prompt("Enter admin password:");
        if (password === ADMIN_PASSWORD) {
            isAuthenticated = true;
        } else {
            alert("Invalid password.");
            window.location.href = "admin.html"; // Redirect to display page
        }
    }
}

// Display images on the display page
function displayImages() {
    const gallery = document.getElementById('image-gallery');
    const images = JSON.parse(localStorage.getItem('images')) || [];

    images.forEach(image => {
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.statement;
        const caption = document.createElement('p');
        caption.textContent = image.statement;
        gallery.appendChild(img);
        gallery.appendChild(caption);
    });
}


function uploadImage() {
    const imageInput = document.getElementById('imageInput');

    if (imageInput.files.length === 0) {
        alert("Please provide an image");
        return;
    }

    const file = imageInput.files[0];
    const reader = new FileReader();

    reader.onload = function(e) {
        const images = JSON.parse(localStorage.getItem('images')) || [];
        images.push({ url: e.target.result });
        localStorage.setItem('images', JSON.stringify(images));
        alert("Image uploaded successfully!");
        
        // Clear the image input after upload
        imageInput.value = '';

        displayUploadedImages();
    };

    reader.readAsDataURL(file);
}



// Function to open an image in full screen
function openInFullScreen(imgElement) {
    if (imgElement.requestFullscreen) {
        imgElement.requestFullscreen(); 
    } else if (imgElement.mozRequestFullScreen) { // Firefox
        imgElement.mozRequestFullScreen(); 
    } else if (imgElement.webkitRequestFullscreen) { // Chrome, Safari, and Opera
        imgElement.webkitRequestFullscreen(); 
    } else if (imgElement.msRequestFullscreen) { // IE/Edge
        imgElement.msRequestFullscreen(); 
    }
}

// Display images on the display page
function displayImages() {
    const gallery = document.getElementById('image-gallery');
    const images = JSON.parse(localStorage.getItem('images')) || [];

    images.forEach(image => {
        const img = document.createElement('img');
        img.src = image.url;
        // img.alt = image.statement;
        img.style.cursor = 'pointer'; // Make it clear the image is clickable
        img.onclick = () => openInFullScreen(img); // Fullscreen on click

        const caption = document.createElement('p');
        // caption.textContent = image.statement;
        gallery.appendChild(img);
        // gallery.appendChild(caption);
    });
}

// Display uploaded images on the admin page
function displayUploadedImages() {
    const uploadedImages = document.getElementById('uploaded-images');
    uploadedImages.innerHTML = ""; // Clear existing images
    const images = JSON.parse(localStorage.getItem('images')) || [];

    images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.statement;
        img.style.cursor = 'pointer'; // Make it clear the image is clickable
        img.onclick = () => openInFullScreen(img); // Fullscreen on click

        const deleteButton = document.createElement('button');
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteImage(index);

        uploadedImages.appendChild(img);
        uploadedImages.appendChild(deleteButton);
    });
}

// Display uploaded images on the admin page
function displayUploadedImages() {
    const uploadedImages = document.getElementById('uploaded-images');
    uploadedImages.innerHTML = ""; // Clear existing images
    const images = JSON.parse(localStorage.getItem('images')) || [];

    images.forEach((image, index) => {
        const img = document.createElement('img');
        img.src = image.url;
        img.alt = image.statement;

        const deleteButton = document.createElement('button');
        deleteButton.setAttribute("class", "del-btn");
        deleteButton.textContent = "Delete";
        deleteButton.onclick = () => deleteImage(index);

        uploadedImages.appendChild(img);
        uploadedImages.appendChild(deleteButton);
    });
}

// Delete an image
function deleteImage(index) {
    const images = JSON.parse(localStorage.getItem('images'));
    images.splice(index, 1);
    localStorage.setItem('images', JSON.stringify(images));
    displayUploadedImages(); // Refresh the image list
}

// Logout function
function logout() {
    isAuthenticated = false;
    window.location.href = "index.html"; // Redirect to display page
}

// Execute functions
if (document.title === "Rise To Fitness") {
    displayImages();
} else if (document.title === "Admin Panel") {
    checkAuthentication();
    displayUploadedImages();
}
