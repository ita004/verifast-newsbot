// Try to load .env from the current directory first, then from parent directory if needed
const fs = require('fs');
const path = require('path');

if (fs.existsSync(path.join(__dirname, '.env'))) {
  require('dotenv').config();
} else if (fs.existsSync(path.join(__dirname, '../.env'))) {
  require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
} else {
  console.warn('No .env file found in either current or parent directory');
  require('dotenv').config(); // Still try to load from process.env
}
const app = require('./app');

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
