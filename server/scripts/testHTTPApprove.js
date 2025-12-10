const http = require('http');

function makeRequest(options, data) {
    return new Promise((resolve, reject) => {
        const req = http.request(options, (res) => {
            let body = '';
            res.on('data', chunk => body += chunk);
            res.on('end', () => {
                try {
                    const json = JSON.parse(body);
                    if (res.statusCode >= 400) {
                        reject({ status: res.statusCode, data: json });
                    } else {
                        resolve({ status: res.statusCode, data: json });
                    }
                } catch (e) {
                    resolve({ status: res.statusCode, data: body });
                }
            });
        });

        req.on('error', reject);
        if (data) req.write(JSON.stringify(data));
        req.end();
    });
}

async function testHTTPApprove() {
    try {
        console.log('=== TESTING HTTP /api/approval/approve ===\n');

        // Step 1: Login
        console.log('1. Logging in as moslemzgueb@gmail.com...');
        const loginRes = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/auth/login',
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        }, {
            username: 'moslemzgueb@gmail.com',
            password: 'password123'
        });

        const token = loginRes.data.token;
        console.log('✅ Login successful\n');

        // Step 2: Approve
        console.log('2. Calling /api/approval/approve...');
        const approveRes = await makeRequest({
            hostname: 'localhost',
            port: 3000,
            path: '/api/approval/approve',
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        }, {
            objectType: 'Budget',
            objectId: 4
        });

        console.log('\n✅ HTTP APPROVE SUCCESSFUL!');
        console.log('Response:', JSON.stringify(approveRes.data, null, 2));

    } catch (error) {
        console.error('\n❌ HTTP APPROVE FAILED!');
        const fs = require('fs');
        fs.writeFileSync('server/scripts/error.json', JSON.stringify(error, null, 2));
        if (error.status) {
            console.error('Status:', error.status);
            console.error('Data:', JSON.stringify(error.data, null, 2));
        } else {
            console.error('Error:', error.message);
            console.error('Stack:', error.stack);
        }
    }
}

testHTTPApprove();
