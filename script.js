document.addEventListener('DOMContentLoaded', () => {

    // --- Mobile Menu Toggle ---
    const mobileMenu = document.getElementById('mobile-menu');
    const navBar = document.querySelector('.nav-links');

    if (mobileMenu && navBar) {
        mobileMenu.addEventListener('click', () => {
            navBar.classList.toggle('active');
            mobileMenu.classList.toggle('is-active');
        });
    }

    // --- Comments Form Functionality (only on index.html) ---
    // Check if the comments form exists on the current page
    const commentForm = document.getElementById('comment-form');
    const commentsList = document.getElementById('comments-list');
    const formMessage = document.getElementById('form-message');

    if (commentForm && commentsList) {
        
        // Function to render all comments from localStorage
        const renderComments = () => {
            // Clear the existing comments list
            commentsList.innerHTML = ''; 

            // Get comments from localStorage or initialize an empty array
            const comments = JSON.parse(localStorage.getItem('comments')) || [];
            
            // Loop through each comment and create a new HTML element to display it
            comments.forEach((comment, index) => {
                const commentElement = document.createElement('div');
                commentElement.classList.add('comment-item');
                commentElement.dataset.index = index;

                // Create the avatar element
                const avatar = document.createElement('div');
                avatar.classList.add('comment-avatar');
                if (comment.photo) {
                    const img = document.createElement('img');
                    img.src = comment.photo;
                    img.alt = `${comment.name}'s profile photo`;
                    avatar.appendChild(img);
                } else {
                    avatar.textContent = 'HBD Ritvika';
                }

                // Create the comment content and actions
                const content = document.createElement('div');
                content.classList.add('comment-content');
                content.innerHTML = `
                    <h4>${comment.name}</h4>
                    <p data-comment-text>${comment.comment}</p>
                `;

                // Add edit and delete buttons
                const actions = document.createElement('div');
                actions.classList.add('comment-actions');
                actions.innerHTML = `
                    <button class="edit-button"><i class="fas fa-edit"></i></button>
                    <button class="delete-button"><i class="fas fa-trash-alt"></i></button>
                `;

                // Append everything to the comment element
                commentElement.appendChild(avatar);
                commentElement.appendChild(content);
                commentElement.appendChild(actions);

                // Add event listeners for edit and delete buttons
                const editButton = actions.querySelector('.edit-button');
                const deleteButton = actions.querySelector('.delete-button');

                // Edit button logic
                editButton.addEventListener('click', () => {
                    const commentTextElement = content.querySelector('[data-comment-text]');
                    const currentText = commentTextElement.textContent;
                    
                    if (editButton.dataset.editing === 'true') {
                        // Save the edited comment
                        const newText = commentTextElement.value.trim();
                        if (newText) {
                            comments[index].comment = newText;
                            localStorage.setItem('comments', JSON.stringify(comments));
                            renderComments(); // Re-render to show the updated comment
                        } else {
                            formMessage.textContent = 'Comment cannot be empty.';
                        }
                    } else {
                        // Enter edit mode
                        const textarea = document.createElement('textarea');
                        textarea.classList.add('comment-text-editor');
                        textarea.value = currentText;
                        commentTextElement.replaceWith(textarea);
                        editButton.innerHTML = '<i class="fas fa-save"></i>';
                        editButton.dataset.editing = 'true';
                    }
                });

                // Delete button logic
                deleteButton.addEventListener('click', () => {
                    // This is a simple confirmation, a custom modal is better for production
                    if (window.confirm('Are you sure you want to delete this comment?')) {
                        comments.splice(index, 1);
                        localStorage.setItem('comments', JSON.stringify(comments));
                        renderComments(); // Re-render to show the updated list
                    }
                });

                commentsList.appendChild(commentElement);
            });
        };

        // Handle form submission
        commentForm.addEventListener('submit', async (e) => {
            e.preventDefault(); // Prevent the default form submission

            const nameInput = document.getElementById('name');
            const commentInput = document.getElementById('comment');
            const photoInput = document.getElementById('photo-upload');

            const name = nameInput.value.trim();
            const comment = commentInput.value.trim();

            // Form validation
            if (!name || !comment) {
                formMessage.textContent = 'Please fill out both name and comment fields.';
                return;
            } else {
                formMessage.textContent = ''; // Clear any previous error messages
            }

            let photo = null;
            if (photoInput.files.length > 0) {
                try {
                    // Read the file as a Data URL (base64)
                    photo = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = error => reject(error);
                        reader.readAsDataURL(photoInput.files[0]);
                    });
                } catch (error) {
                    console.error('Error reading file:', error);
                    formMessage.textContent = 'Could not upload photo.';
                    return;
                }
            }

            // Get existing comments from localStorage
            const existingComments = JSON.parse(localStorage.getItem('comments')) || [];

            // Create a new comment object
            const newComment = {
                name: name,
                comment: comment,
                photo: photo, // Store the base64 string or null
                timestamp: new Date().toISOString()
            };

            // Add the new comment to the beginning of the array
            existingComments.unshift(newComment);

            // Save the updated comments array back to localStorage
            localStorage.setItem('comments', JSON.stringify(existingComments));

            // Clear the form fields
            nameInput.value = '';
            commentInput.value = '';
            photoInput.value = '';

            // Re-render the comments list
            renderComments();
        });

        // Initial call to render comments when the page loads
        renderComments();
    }
});
