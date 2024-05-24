const loginButton = document.getElementById("loginButton");

loginButton.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = document.getElementById("emailId").value;
  const password = document.getElementById("enterpassword").value;
  const data = { email, password };

  if (email == "" || password == "") {
    alert("Please fill all the fields");
    return;
  }

  try {
    const response = await fetch('/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data)
    });

    if (response.status === 200) {
      response.json().then((data) => {
        localStorage.setItem('token', data.token);
        // localStorage.setItem('email', email);
        localStorage.setItem('userName', data.userName);
        token = data.token;
        location.href = '/staffquery';
      });
    }
    else if (response.status === 401) {
      alert('Email Id is Not Verified');
    }
    else {
      console.error('Login failed');
    }
  } catch (error) {
    console.error('An error occurred:', error);
  }
});

document.addEventListener('contextmenu', event => {
  event.preventDefault();
});