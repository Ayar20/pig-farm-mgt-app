const url = 'https://ep-little-pond-apalz90p.neonauth.c-7.us-east-1.aws.neon.tech/neondb/auth/sign-up/email';
const body = JSON.stringify({
  email: 'test_error_500@example.com',
  password: 'Password123!',
  name: 'Test'
});

fetch(url, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: body
})
.then(res => res.text().then(text => ({ status: res.status, text })))
.then(console.log)
.catch(console.error);
