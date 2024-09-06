# 🔐 DM Verification with 6-Digit Code

This project sets up a system for user verification via Direct Message (DM) using a 6-digit code that the user must re-enter to confirm their identity.

## 📋 How It Works

- Upon initiating verification, a 6-digit code is sent to the user via DM.
- The user must enter this code to verify their identity.
- If the correct code is entered, the verification is successful.

## ⚙️ Configuration

1. **Install modules** Run the following command to install the necessary dependencies:
   ```bash
    node install_modules.js
    ```
    📦
2. it's crucial to configure the `config.json` and `config1.json` files. These files hold the necessary information for the system to work correctly.

### 🛠️ Example `config.json` structure:

```json
{
  "token": "YOUR_TOKEN",
  "client_id": "YOUR_CLIENT_ID",
  "guildId": "YOUR_GUILD_ID",
  "excepnocap": "CHANNEL_FOR_ERROR_NOTIFICATION (OPTIONAL)"
}
  ```
### 🛠️ Example `config1.json` structure:

```json
{
    "prefix": "!",
    "verificationRoleName": "Verified",
    "verifyChannelId": "YOUR_VERIFY_CHANNEL_ID",
    "verifyMessageId": "YOUR_VERIFY_MESSAGE_ID",
    "language": "en", 
}
