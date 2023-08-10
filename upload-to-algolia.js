const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const algoliasearch = require('algoliasearch');

// Read environment variables
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || '';
const INDEX_NAME = 'awell_developers';

const EXCLUDE_EXTENSIONS = ['awell-extensions', 'hello-world'];

// Function to clear objects in Algolia
async function clearObjects() {
    const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
    const index = client.initIndex(INDEX_NAME);
  
    try {
      const { objectIDs } = await index.deleteBy({
        filters: `space:Awell Extensions`,
      });
      console.log('Objects deleted:', objectIDs);
    } catch (error) {
      console.error('Error deleting objects:', error);
      process.exit(1);
    }
  }

// Function to read README file and extract data
function readReadme(extensionDir) {
  const readmePath = path.join(extensionDir, 'README.md');
  const fileContent = fs.readFileSync(readmePath, 'utf8');
  const { content, data } = matter(fileContent);
  
  return {
    title: data.title || '',
    description: data.description || '',
    content: content,
  };
}

// Function to generate Algolia data array
function generateAlgoliaData() {
  const extensions = glob.sync('./extensions/*/');
  return extensions.map((extensionDir) => {
    const extensionKey = path.basename(extensionDir);
    const { title, description, content } = readReadme(extensionDir);

    return {
      objectID: extensionKey,
      space: 'Awell Extensions',
      title: title,
      description: description,
      content: content,
      slug: `/awell-extensions/marketplace/${extensionKey}`,
    };
  }).filter((extension) => EXCLUDE_EXTENSIONS.includes(extension.objectID) === false);
}

// Upload data to Algolia
async function uploadDataToAlgolia(data) {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  const index = client.initIndex(INDEX_NAME);

  try {
    const { objectIDs } = await index.saveObjects(data);
    console.log('Objects added/updated:', objectIDs);
  } catch (error) {
    console.error('Error adding/updating objects:', error);
    process.exit(1);
  }
}

// Main function to generate and upload data
async function main() {
  const algoliaData = generateAlgoliaData();
  await clearObjects();
  await uploadDataToAlgolia(algoliaData);
}

main();
