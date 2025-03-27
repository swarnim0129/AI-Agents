try {
  const response = await axios.post('http://localhost:5001/api/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
} catch (error) {
  console.error('Upload error:', error);
  // Add better error handling here
} 