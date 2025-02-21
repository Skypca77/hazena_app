// Add files from this directory
export * from './sessions';
export * from './auth';
export * from './drinks';
export * from './friends';
export * from './archive';
export * from './profile';

// Until all functions are moved out of old appwrite.js, you can 
// reference them in old way for depenendencies
export * from '../appwrite';

// Database functions will then be accesible from single file
// => '@aw/index' 
    
