const fetchSecrets = async () => {
    try {
      const response = await fetch('https://your-backend-url/api/secrets');
      if (!response.ok) {
        throw new Error('Failed to fetch secrets');
      }
      const secrets = await response.json();
      return secrets;
    } catch (error) {
      console.error('Error fetching secrets:', error);
      return null;
    }
  };
  
  export default fetchSecrets;
  