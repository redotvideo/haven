import axios from 'axios';
import { createDataset } from '../database/dataset';
import { downloadFile } from '../utils/modal';

const HUGGINGFACE_API_BASE_URL = 'https://huggingface.co/api';

export async function searchDatasets(query: string) {
  const response = await axios.get(`${HUGGINGFACE_API_BASE_URL}/datasets/search`, {
    params: { search: query },
  });
  return response.data;
}

export async function downloadDataset(datasetId: string, userId: string) {
  const datasetResponse = await axios.get(`${HUGGINGFACE_API_BASE_URL}/datasets/${datasetId}/download`, {
    responseType: 'blob',
  });

  const datasetContent = datasetResponse.data;
  const fileName = `${datasetId}.zip`;

  const downloadUrl = await downloadFile(datasetContent, fileName);

  // Assuming the function to extract metadata from the dataset file exists
  const { name, rows } = extractMetadataFromDataset(datasetContent);

  await createDataset(userId, name, downloadUrl, rows);
}

import JSZip from 'jszip';

function extractMetadataFromDataset(datasetContent: Blob): Promise<{ name: string; rows: number }> {
  return new Promise((resolve, reject) => {
    const zip = new JSZip();
    zip.loadAsync(datasetContent)
      .then(zip => {
        // Assuming the dataset is in a file named 'data.csv' inside the zip
        zip.file('data.csv').async('string').then(content => {
          const rows = content.split('\n').length - 1; // Subtract 1 for the header row
          const name = 'Extracted Dataset Name'; // Placeholder for actual logic to extract name
          resolve({ name, rows });
        }).catch(reject);
      }).catch(reject);
  });
}
