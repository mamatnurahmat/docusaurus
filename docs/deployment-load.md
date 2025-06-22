import React from 'react';

// Import data JSON dari folder static
import deployments from '@site/static/data/deployments.json';

# Deployment Load (Dynamic Table)

Berikut adalah tabel yang di-load langsung dari file JSON:

<table>
  <thead>
    <tr>
      <th>Namespace</th>
      <th>Name</th>
      <th>Port</th>
    </tr>
  </thead>
  <tbody>
    {deployments.map((item, idx) => (
      <tr key={idx}>
        <td>{item.namespace}</td>
        <td>{item.name}</td>
        <td>{item.port}</td>
      </tr>
    ))}
  </tbody>
</table> 