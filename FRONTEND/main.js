const menuBtn = document.getElementById("menu-btn");
const navLinks = document.getElementById("nav-links");
const menuBtnIcon = menuBtn.querySelector("i");

menuBtn.addEventListener("click", (e) => {
  navLinks.classList.toggle("open");
  const isOpen = navLinks.classList.contains("open");
  menuBtnIcon.setAttribute("class", isOpen ? "ri-close-line" : "ri-menu-line");
});


navLinks.addEventListener("click", (e) => {
  // nav.classList.remove("open");
  navLinks.style.top = "0px";
  navLinks.style.top = "none";
  menuBtnIcon.setAttribute("class", "ri-menu-line");
});

const scrollRevealOption = {
  distance: "50px",
  origin: "bottom",
  duration: 1000,
};

ScrollReveal().reveal(".header__content h1", {
  ...scrollRevealOption,
});
ScrollReveal().reveal(".header__content h2", {
  ...scrollRevealOption,
  delay: 500,
});
ScrollReveal().reveal(".header__content p", {
  ...scrollRevealOption,
  delay: 1000,
});
ScrollReveal().reveal(".header__content .header__btn", {
  ...scrollRevealOption,
  delay: 1500,
});

ScrollReveal().reveal(".about__card", {
  duration: 1000,
  interval: 500,
});

ScrollReveal().reveal(".trainer__card", {
  ...scrollRevealOption,
  interval: 500,
});

ScrollReveal().reveal(".blog__card", {
  ...scrollRevealOption,
  interval: 500,
});

// Image upload
document.getElementById('uploadForm').addEventListener('submit', function(e) {
  e.preventDefault();
  const formData = new FormData(this);
  fetch('/upload', {
    method: 'POST',
    body: formData
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('uploadMessage').innerText = data.message;
  })
  .catch(error => {
    document.getElementById('uploadMessage').innerText = 'Error: ' + error.message;
  });
});

// Update content
document.getElementById('updateContent').addEventListener('click', function() {
  const content = document.getElementById('contentText').value;
  fetch('/update-content', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ content: content })
  })
  .then(response => response.json())
  .then(data => {
    document.getElementById('updateMessage').innerText = data.message;
  })
  .catch(error => {
    document.getElementById('updateMessage').innerText = 'Error: ' + error.message;
  });
});


// Automatically move to the next slide every 3 seconds
setInterval(showNextCarouselSlide, 3000);


function openGmail() {
  var subject = encodeURIComponent("Your Subject");
  var body = encodeURIComponent("Your message goes here");
  window.open("https://mail.google.com/mail/?view=cm&fs=1&to=prami72rao@gmail.com&su=" + subject + "&body=" + body);
}
