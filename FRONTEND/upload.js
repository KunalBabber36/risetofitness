document.getElementById('uploadForm').addEventListener('submit', async (event) => {
    event.preventDefault();
  
    const formData = new FormData(event.target);
  
    try {
      const response = await fetch('http://localhost:3000/upload', {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      console.log(result);
      if (response.ok) {
        alert('Image uploaded successfully');
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
    }
  });
  