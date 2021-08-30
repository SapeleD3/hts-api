//load dependencies
import app from './app';
import { connectToDB } from './index.constants';

connectToDB();

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => {
  console.log(`App is running on port: ${PORT}`);
});
