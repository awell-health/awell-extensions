import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { algoliasearch } from 'algoliasearch';
import { globSync } from 'glob';

// Read environment variables
const ALGOLIA_APP_ID = process.env.ALGOLIA_APP_ID || 'O53UAVSSKA';
const ALGOLIA_ADMIN_KEY = process.env.ALGOLIA_ADMIN_KEY || 'f5f192b7de58b933d0a954cb7ba558b3';
const INDEX_NAME = 'awell_developers';
const EXCLUDE_EXTENSIONS = ['wellinks', 'hello-world', 'avaAi'];

async function clearObjects(client) {
  try {
    const response = await client.deleteBy({
      indexName: INDEX_NAME,
      deleteByParams: {
        filters: "source:awell-extensions-github-repo",
      },
    });
    console.log('Objects deleted:', response);
  } catch (error) {
    console.error('Error deleting objects:', error);
    process.exit(1);
  }
}

function readReadme(extensionDir) {
  const readmePath = path.join(extensionDir, 'README.md');
  const fileContent = fs.readFileSync(readmePath, 'utf8');
  const { content, data } = matter(fileContent);

  return {
    title: data.title || '',
    description: data.description || '',
    content,
  };
}

function generateAlgoliaData() {
  const extensions = globSync('./extensions/*/');
  return extensions.map((extensionDir) => {
    const extensionKey = path.basename(extensionDir);
    const { title, description, content } = readReadme(extensionDir);

    return {
      objectID: extensionKey,
      space: 'Awell Extensions',
      title,
      description,
      content,
      slug: `awell-extensions/marketplace/${extensionKey}`,
      source: 'awell-extensions-github-repo',
    };
  }).filter((ext) => !EXCLUDE_EXTENSIONS.includes(ext.objectID));
}

async function uploadDataToAlgolia(client, data) {
  try {
    const response = await client.saveObjects({
      indexName: INDEX_NAME,
      objects: data,
    });
    console.log('Objects added/updated:', response);
  } catch (error) {
    console.error('Error adding/updating objects:', error);
    process.exit(1);
  }
}

async function main() {
  const client = algoliasearch(ALGOLIA_APP_ID, ALGOLIA_ADMIN_KEY);
  const algoliaData = generateAlgoliaData();
   
  await clearObjects(client);
  await uploadDataToAlgolia(client, algoliaData);
}

main();

