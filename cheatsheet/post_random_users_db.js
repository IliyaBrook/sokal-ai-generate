function generateUsers(count) {
  const users = [];
  for (let i = 0; i < count; i++) {
    const firstName = `FirstName${i}`;
    const lastName = `LastName${i}`;
    const email = `user${i}@example.com`;
    const password = `password${i}`;
    
    users.push({
      email: email,
      firstname: firstName,
      lastname: lastName,
      password: password,
    });
  }
  return users;
}

const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjY3ZGFkODQ3NDY2YjNjMDRhNjljN2RlMyIsImVtYWlsIjoiaWxpeWFicm9vazE5ODdAZ21haWwuY29tIiwiaWF0IjoxNzQyMzk1Nzk4LCJleHAiOjE3NDIzOTc1OTh9.DA7AbgjT9NPkatVCD27h5wHlrVlDGRKDWUVJO66LkPE'

const randomUsers = generateUsers(50);
const addDelay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
const fetchRandomUser = async (user) => {
  return new Promise((resolve, reject) => {
    addDelay(300).then(() => {
      fetch('http://localhost:4000/api/user/sign-up', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(user),
      }).then(response => {
        if (response.status === 200) {
          resolve(response.json())
        } else {
          reject(response.json())
        }
      })
    })
  })
}

Promise.all(randomUsers.map(fetchRandomUser))
  .then(result => {
    console.log(result)
  }).catch(err => {
    console.log(err)
  })