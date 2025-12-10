const http = require('http');

async function testPaymentAPI() {
    const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibmFtZSI6IlN5c3RlbSBBZG1pbiIsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJlbnRpdHlfaWQiOm51bGwsImlhdCI6MTczMzc1NTQyMCwiZXhwIjoxNzMzNzU5MDIwfQ.vhbWNBvtU7EjYMjC1Pd_YvY4dJKIIxpRCkf0KaRg-Xw';

    const options = {
        hostname: 'localhost',
        port: 3000,
        path: '/api/payments/2',
        method: 'GET',
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    const req = http.request(options, (res) => {
        let data = '';

        res.on('data', (chunk) => {
            data += chunk;
        });

        res.on('end', () => {
            console.log('Status:', res.statusCode);
            console.log('Response:', data);
            try {
                const json = JSON.parse(data);
                console.log('Parsed:', JSON.stringify(json, null, 2));
            } catch (e) {
                console.log('Could not parse JSON');
            }
        });
    });

    req.on('error', (error) => {
        console.error('Error:', error.message);
    });

    req.end();
}

testPaymentAPI();
