document.addEventListener('DOMContentLoaded', () => {
	const myForm = document.querySelector('form');
	if (myForm) {
		myForm.addEventListener('submit', async (e) => {
			e.preventDefault();
			const formData = {};
			
			if (myForm.elements.email.value.length === 0 || myForm.elements.password.value.length === 0) {
				alert('Please fill in all fields');
			}
			for (let element of myForm.elements) {
				if (element.name.length > 0) {
					formData[element.name] = element.value;
				}
			}

			try {
				const url = window.location.hostname.includes('localhost')
					? 'http://localhost:8080/api/auth/login'
					: 'https://node-express-production-a816.up.railway.app/api/auth/login';
				await fetch(url, {
					method: 'POST',
					body: JSON.stringify(formData),
					headers: {
						'Content-Type': 'application/json'
					}
				})
				.then(res => res.json())
				.then(data => {
					console.log('data', data);
					if (data) {
						localStorage.setItem('token', data.token);
						localStorage.setItem('email', data.user.email);
						window.location.href = '/chat.html';
					}
				});
			} catch (error) {
				console.log('error logging in', error);
			}
		});
	}
});

function googleLogin(response) {
	try {
		const url = window.location.hostname.includes('localhost')
			? 'http://localhost:8080/api/auth/google'
			: 'https://node-express-production-a816.up.railway.app/api/auth/google';
		
		fetch(url, {
			method: 'POST',
			body: JSON.stringify({ id_token: response.credential }),
			headers: {
				'Content-Type': 'application/json'
			}
		})
		.then(res => res.json())
		.then(data => {
			console.log('Google Sign-In successful:', data);
			if (data) {
				localStorage.setItem('token', data.token);
				localStorage.setItem('email', data.user.email);
				window.location.href = '/chat.html';
			} else {
				console.log('error signing in with google', data);
			}
		});
	} catch (error) {
		console.log('error signing in with google', error);
	}
}

function signOut() {
	google.accounts.id.disableAutoSelect();
	google.accounts.id.revoke(localStorage.getItem('email'), done => {
		localStorage.clear();
		location.reload();
	});
}