# Storage Configuration Guide

This application supports multiple cloud storage providers for file storage. You can easily switch between **AWS S3** and **DigitalOcean Spaces** using environment variables.

## 🎯 Quick Start

### Switching Storage Providers

Simply change the `STORAGE_PROVIDER` environment variable:

```env
# For AWS S3 (default)
STORAGE_PROVIDER=aws

# For DigitalOcean Spaces
STORAGE_PROVIDER=digitalocean
```

## 📋 Environment Variables

### AWS S3 Configuration

When using AWS S3 (`STORAGE_PROVIDER=aws`), set these variables:

```env
STORAGE_PROVIDER=aws
AWS_S3_BUCKET_NAME=your-bucket-name
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your-access-key-id
AWS_SECRET_ACCESS_KEY=your-secret-access-key
```

### DigitalOcean Spaces Configuration

When using DigitalOcean Spaces (`STORAGE_PROVIDER=digitalocean`), set these variables:

```env
STORAGE_PROVIDER=digitalocean
DO_SPACES_BUCKET_NAME=your-spaces-bucket-name
DO_SPACES_REGION=nyc3
DO_SPACES_ACCESS_KEY=your-spaces-access-key
DO_SPACES_SECRET_KEY=your-spaces-secret-key
```

**Note:** DigitalOcean Spaces regions include: `nyc3`, `ams3`, `sgp1`, `sfo3`, `fra1`, `blr1`

## 🔄 Migration Between Providers

The system automatically handles files from both providers:

1. **Existing files** stored in AWS S3 will continue to work even after switching to DigitalOcean
2. **New files** will be stored in the currently configured provider
3. **File access** automatically detects which provider a file is stored in and uses the correct one

## 📝 Example .env Configuration

### Using AWS S3 (Default)
```env
# Storage Provider
STORAGE_PROVIDER=aws

# AWS S3 Configuration
AWS_S3_BUCKET_NAME=bgvs-storage
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=AKIAIOSFODNN7EXAMPLE
AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY
```

### Using DigitalOcean Spaces
```env
# Storage Provider
STORAGE_PROVIDER=digitalocean

# DigitalOcean Spaces Configuration
DO_SPACES_BUCKET_NAME=bgvs-storage
DO_SPACES_REGION=nyc3
DO_SPACES_ACCESS_KEY=your-do-access-key
DO_SPACES_SECRET_KEY=your-do-secret-key
```

## 🛠️ Setup Instructions

### Setting up AWS S3

1. Create an S3 bucket in your AWS account
2. Create an IAM user with S3 access permissions
3. Generate access keys for the IAM user
4. Add the credentials to your `.env` file

### Setting up DigitalOcean Spaces

1. Create a Space in your DigitalOcean account
2. Generate API keys (Spaces Access Keys) in DigitalOcean
3. Note your Space's region (e.g., `nyc3`, `ams3`)
4. Add the credentials to your `.env` file

## 🔍 Verifying Configuration

The application will log the storage provider being used on startup:

```
📦 Using storage provider: aws
```

or

```
📦 Using storage provider: digitalocean
```

## ⚠️ Important Notes

1. **Cost Management**: DigitalOcean Spaces offers a $5/month plan with 250GB storage and 1TB transfer, which is more cost-effective for smaller applications.

2. **Backward Compatibility**: Files stored in AWS S3 will continue to be accessible even after switching to DigitalOcean Spaces. The system automatically detects the provider based on the file URL.

3. **No Data Migration Required**: You don't need to migrate existing files. The system handles both providers seamlessly.

4. **Pre-signed URLs**: Both providers support pre-signed URLs for secure, time-limited file access.

## 🐛 Troubleshooting

### Error: "Missing storage configuration"

Make sure all required environment variables for your chosen provider are set in your `.env` file.

### Error: "Failed to upload file"

1. Verify your credentials are correct
2. Check that your bucket/space exists
3. Ensure your access keys have the correct permissions
4. Verify the region is correct

### Files not accessible after switching providers

This is normal! Files stored in the previous provider will still be accessible. The system automatically detects which provider each file is stored in.

## 📚 Additional Resources

- [AWS S3 Documentation](https://docs.aws.amazon.com/s3/)
- [DigitalOcean Spaces Documentation](https://docs.digitalocean.com/products/spaces/)
