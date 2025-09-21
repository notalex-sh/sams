# SAMS - Secure Access Management System v2.0

A modern, secure password manager built with SvelteKit and Tailwind CSS. All encryption happens locally in your browser using industry-standard AES-256-GCM encryption.

## Features

- **Local Encryption**: All data is encrypted locally using AES-256-GCM with PBKDF2 key derivation
- **Password Expiry Alerts**: Set expiry dates for passwords and get notified when they need updating
- **Password Generator**: Generate secure passwords with customizable options and preview before saving
- **CSV Export**: Export your data to CSV format (with or without passwords)
- **Tag System**: Organize entries with tags for easy filtering
- **Search & Filter**: Quickly find entries with search and tag filtering
- **No Backend Required**: Everything runs in your browser, no server needed

## Project Structure

```
sams-password-manager/
├── src/
│   ├── routes/
│   │   ├── +layout.svelte      # Root layout
│   │   └── +page.svelte        # Main page
│   ├── lib/
│   │   ├── components/         # UI components
│   │   ├── stores/            # Svelte stores
│   │   └── utils/             # Utility functions
│   ├── app.html               # HTML template
│   └── app.css                # Global styles
├── static/                    # Static assets
├── package.json              # Dependencies
├── svelte.config.js          # SvelteKit config
├── vite.config.js           # Vite config
├── tailwind.config.js       # Tailwind config
└── postcss.config.js        # PostCSS config
```

## Security

### Encryption Details

- **Algorithm**: AES-256-GCM (256-bit key)
- **Key Derivation**: Argon2 with SHA-256
- **Iterations**: 100,000
- **Salt**: 16 bytes (randomly generated)
- **IV**: 12 bytes (randomly generated for each encryption)

### Security Best Practices

1. **Strong Master Password**: Use a strong, unique master password
2. **Regular Backups**: Save your encrypted database regularly
3. **Password Rotation**: Update passwords when they expire
4. **Local Storage Only**: No data is sent to any server
5. **HTTPS Only**: Deploy only on HTTPS-enabled domains

## Usage

### Creating a New Database

1. Click "Create New Database"
2. Set a strong master password
3. Confirm the password
4. Start adding entries

### Adding Entries

1. Fill in the entry details (title is required)
2. Generate a secure password or enter your own
3. Set password expiry days (default: 90)
4. Add tags for organization
5. Click "Add Entry"

### Password Expiry

- Entries with passwords show expiry status
- Yellow warning when password expires in 14 days or less
- Red alert when password has expired
- Click "Regenerate" to create a new password and reset expiry

### Exporting Data

- **CSV Export**: Unencrypted, compatible with spreadsheets
- **JSON Export**: Encrypted with your master password
- Option to include/exclude passwords in CSV export

### Keyboard Shortcuts

- `Ctrl/Cmd + S`: Save database

## Browser Support

Requires a modern browser with Web Crypto API support:
- Chrome 37+
- Firefox 34+
- Safari 10.1+
- Edge 79+

## License

MIT License - See LICENSE file for details

## Development Notes

The codebase follows these conventions:
- Components use single-file Svelte components
- Encryption logic is isolated in utility modules
- State management uses Svelte stores
- All sensitive operations happen client-side
- Comments are developer-focused and concise

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly (especially encryption/decryption)
5. Submit a pull request

## Troubleshooting

### "Invalid password" error
- Ensure you're using the correct password
- Check if the database file is corrupted

### Can't save database
- Check browser permissions for file downloads
- Ensure sufficient disk space

### Password generator not working
- Browser must support crypto.getRandomValues()
- Check browser console for errors
