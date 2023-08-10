const fs = require('fs');
const path = require('path');
const glob = require('glob');
const matter = require('gray-matter');
const algoliasearch = require('algoliasearch');

// Read environment variables
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || '';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || '';
const INDEX_NAME = 'awell_developers';

// Function to read README file and extract data
function readReadme(extensionDir) {
  const readmePath = path.join(extensionDir, 'README.md');
  const content = fs.readFileSync(readmePath, 'utf8');
  const { data } = matter(content);
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
      space: 'awell-extensions',
      title: title,
      description: description,
      content: content,
      slug: `/awell-extensions/marketplace/${extensionKey}`,
    };
  });
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
  await uploadDataToAlgolia(algoliaData);
}

main();
