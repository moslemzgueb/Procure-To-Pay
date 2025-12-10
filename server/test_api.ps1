$headers = @{
    "Authorization" = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6NiwibmFtZSI6IlN5c3RlbSBBZG1pbiIsInJvbGUiOiJzeXN0ZW1fYWRtaW4iLCJlbnRpdHlfaWQiOm51bGwsImlhdCI6MTczMzc1NTQyMCwiZXhwIjoxNzMzNzU5MDIwfQ.vhbWNBvtU7EjYMjC1Pd_YvY4dJKIIxpRCkf0KaRg-Xw"
}

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/payments/2" -Headers $headers -Method GET
    Write-Host "Status Code: $($response.StatusCode)"
    Write-Host "Response:"
    $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10
} catch {
    Write-Host "Error: $($_.Exception.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response Body: $responseBody"
    }
}
