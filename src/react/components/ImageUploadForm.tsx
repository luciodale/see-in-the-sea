import { useEffect, useState } from 'react';
// If you integrate with Clerk's frontend SDK later, you might still use useAuth for other things,
// but not directly for injecting the token into headers for same-origin requests.
// import { useAuth } from '@clerk/clerk-react';

export function ImageUploadForm() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [contest, setContest] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);

    // Fetch active contest and categories on component mount
    useEffect(() => {
        const fetchContestData = async () => {
            try {
                                 const response = await fetch('/api/contests');
                 const data = await response.json() as { success: boolean; data: { contest: any; categories: any[] } };
                 
                 if (data.success) {
                     setContest(data.data.contest);
                     setCategories(data.data.categories);
                } else {
                    setMessage('No active contest found');
                }
            } catch (error) {
                setMessage('Failed to load contest information');
                console.error('Failed to fetch contest data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchContestData();
    }, []);

    // MOCK TOKEN: Removed from direct use in fetch headers.
    // The server-side will look for the token in the cookie.

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type.startsWith('image/')) {
            setSelectedFile(file);
            setMessage(''); // Clear previous messages
        } else {
            setSelectedFile(null);
            setMessage('Please select a valid image file (e.g., JPG, PNG).');
        }
    };

    const handleSubmit = async (event) => {
        event.preventDefault(); // Prevent default form submission behavior
        setMessage(''); // Clear previous messages

        if (!selectedFile) {
            setMessage('Please select an image to upload.');
            return;
        }

        if (!selectedCategory) {
            setMessage('Please select a category for your photo.');
            return;
        }

        if (!title.trim()) {
            setMessage('Please enter a title for your photo.');
            return;
        }

        setUploading(true); // Indicate that upload is in progress

        // Create a FormData object to send multipart/form-data
        const formData = new FormData();
        formData.append('image', selectedFile); // 'image' matches formData.get('image') in your API
        formData.append('contestId', contest.id);
        formData.append('categoryId', selectedCategory);
        formData.append('title', title);
        formData.append('description', description);

        try {
            // **No manual token injection here!**
            // The browser automatically sends relevant cookies (like Clerk's __session cookie)
            // with same-origin requests.
            const response = await fetch('/api/upload-image', { // Your Astro API endpoint
                method: 'POST',
                // IMPORTANT: Do NOT manually set 'Content-Type': 'multipart/form-data'.
                // When you provide a FormData object as the `body`, the browser automatically
                // sets the correct 'Content-Type' header, including the necessary boundary string.
                //
                // No 'headers' object needed for Authorization if it's in a cookie.
                // If your API is on a different domain, you might need 'credentials: "include"'
                // but for same-origin Astro API routes, this is usually the default.
                body: formData, // Send the FormData object directly
            });

            if (response.ok) {
                const data = await response.json();
                setMessage(`Upload successful! R2 Key: ${data.r2Key}`);
                setSelectedFile(null); // Clear the selected file input
            } else {
                const errorData = await response.json();
                setMessage(`Upload failed: ${errorData.message || 'Unknown error'}`);
            }
        } catch (error) {
            console.error('Network or unexpected error during upload:', error);
            setMessage(`An unexpected error occurred: ${error.message}`);
        } finally {
            setUploading(false); // End upload process
        }
    };

    return (
        <div style={{
            fontFamily: 'Inter, sans-serif',
            maxWidth: '500px',
            margin: '40px auto',
            padding: '20px',
            border: '1px solid #e0e0e0',
            borderRadius: '12px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.05)',
            backgroundColor: '#fff'
        }}>
            <h2 style={{ color: '#333', textAlign: 'center', marginBottom: '20px' }}>Image Upload (Multipart/Form-Data)</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                <div>
                    <label htmlFor="imageFile" style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#555' }}>
                        Select Image File:
                    </label>
                    <input
                        type="file"
                        id="imageFile"
                        name="image" // Crucial: This name 'image' must match formData.get('image') on the server
                        accept="image/*" // Only allow image files
                        onChange={handleFileChange}
                        style={{
                            width: '100%',
                            padding: '10px',
                            border: '1px solid #ddd',
                            borderRadius: '8px',
                            boxSizing: 'border-box'
                        }}
                    />
                </div>

                <button
                    type="submit"
                    disabled={uploading || !selectedFile}
                    style={{
                        padding: '12px 20px',
                        backgroundColor: '#007bff',
                        color: 'white',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '16px',
                        fontWeight: 'bold',
                        transition: 'background-color 0.3s ease',
                        opacity: (uploading || !selectedFile) ? 0.7 : 1
                    }}
                >
                    {uploading ? 'Uploading...' : 'Upload Image'}
                </button>
            </form>

            {message && (
                <p style={{
                    marginTop: '20px',
                    padding: '10px',
                    borderRadius: '8px',
                    backgroundColor: message.includes('successful') ? '#e6ffe6' : '#ffe6e6',
                    color: message.includes('successful') ? '#006600' : '#cc0000',
                    border: `1px solid ${message.includes('successful') ? '#00cc00' : '#ff0000'}`
                }}>
                    {message}
                </p>
            )}

            <div style={{ marginTop: '20px', fontSize: '14px', color: '#777' }}>
                <p><strong>Current Values:</strong></p>
                <ul>
                    <li>Contest: <code>{contest.name}</code></li>
                    <li>Category: <code>{selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Not selected'}</code></li>
                    <li>Title: <code>{title || 'Not entered'}</code></li>
                    <li>Description: <code>{description || 'None'}</code></li>
                    <li>Authentication handled via browser cookies.</li>
                </ul>
            </div>
        </div>
    );
}