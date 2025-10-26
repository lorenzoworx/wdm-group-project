import React, { useState } from 'react';

const Resources = () => {
  const [resources] = useState([
    {
      name: 'Syllabus_CS5335.pdf',
      type: 'PDF',
      department: 'CS Dept',
      access: 'Public',
      actions: ['View', 'Download']
    },
    {
      name: 'Lecture_1_Slides.pptx',
      type: 'Slides',
      department: 'CS Dept',
      access: 'Members',
      actions: ['View', 'Download']
    },
    {
      name: 'Intro to Git (YouTube)',
      type: 'Link',
      department: 'IT Dept',
      access: 'Public',
      actions: ['Open'],
      url: 'https://www.youtube.com/watch?v=8JJ101D3knE'
    }
  ]);

  const [filter, setFilter] = useState('All Types');
  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');

  // uploadedResources stored as { [filename]: { mime, base64 } }
  const [uploadedResources, setUploadedResources] = useState(() => {
    try {
      const raw = localStorage.getItem('uploadedResources');
      return raw ? JSON.parse(raw) : {};
    } catch (e) {
      return {};
    }
  });

  const saveUploadedResources = (map) => {
    setUploadedResources(map);
    try { localStorage.setItem('uploadedResources', JSON.stringify(map)); } catch (e) { console.warn(e); }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result; // data:<mime>;base64,....
      const parts = dataUrl.split(',');
      const meta = parts[0];
      const base64 = parts[1];
      const mimeMatch = /data:([^;]+);base64/.exec(meta);
      const mime = mimeMatch ? mimeMatch[1] : 'application/octet-stream';
      const name = file.name;
      const next = { ...uploadedResources, [name]: { mime, base64 } };
      saveUploadedResources(next);
      alert(`Uploaded ${name} and stored locally. You can now View/Download it in Resources.`);
    };
    reader.readAsDataURL(file);
    // reset input value so same file can be uploaded again
    e.target.value = '';
  };

  const getUploadedResource = (resource) => {
    if (!resource) return null;
    const entry = uploadedResources[resource.name];
    if (!entry) return null;
    // convert base64 to blob
    try {
      const byteChars = atob(entry.base64);
      const byteNumbers = new Array(byteChars.length);
      for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: entry.mime });
      return { blob, mime: entry.mime };
    } catch (e) {
      console.warn('failed to decode uploaded resource', e);
      return null;
    }
  };

  const getResourceUrl = (resource) => {
    // If resource already has an explicit URL (like external links), use it.
    if (resource.url) return resource.url;

    // Otherwise assume the file is placed under public/resources/<filename>
    const base = process.env.PUBLIC_URL ? process.env.PUBLIC_URL : '';
    // Ensure leading slash
    const prefix = base.endsWith('/') ? base.slice(0, -1) : base;
    return `${prefix}/resources/${encodeURIComponent(resource.name)}`;
  };

  const handleView = async (resource) => {
    // Open a new blank window synchronously to avoid popup blocking.
    const newWin = window.open('', '_blank');
    if (!newWin) {
      alert('Unable to open a new window. Please allow popups for this site.');
      return;
    }

    // If resource is a link type, navigate the opened window to it
    if (resource.url && resource.type === 'Link') {
      newWin.location.href = resource.url;
      return;
    }

    // If the user uploaded the resource earlier, open the blob URL in the new window
    const uploaded = getUploadedResource(resource);
    if (uploaded) {
      const blobUrl = URL.createObjectURL(uploaded.blob);
      newWin.location.href = blobUrl;
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 60 * 1000);
      return;
    }

    // Otherwise fetch the public/external URL and open the fetched blob in the window
    const url = getResourceUrl(resource);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const blob = await res.blob();
      const blobUrl = URL.createObjectURL(blob);
      newWin.location.href = blobUrl;
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 60 * 1000);
    } catch (err) {
      console.warn('Failed to view resource', url, err);
      // close the blank window we opened since we couldn't load the resource
      try { newWin.close(); } catch (e) {}
      alert(`Could not open resource: ${err.message}`);
    }
  };

  const handleDownload = async (resource) => {
    // External links should just open
    if (resource.url && resource.type === 'Link') return handleOpen(resource);

    // Prefer uploaded resource if available
    const uploaded = getUploadedResource(resource);
    if (uploaded) {
      const blobUrl = URL.createObjectURL(uploaded.blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resource.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
      return;
    }

    const url = getResourceUrl(resource);
    try {
      const res = await fetch(url, { cache: 'no-store' });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const contentTypeHeader = res.headers.get('content-type') || '';
      console.debug('Download content-type header:', contentTypeHeader);

      const blob = await res.blob();
      console.debug('Download blob type:', blob.type);

      const isPdf = blob.type === 'application/pdf' || contentTypeHeader.includes('application/pdf');

      if (resource.type === 'PDF' && !isPdf) {
        // Provide a fallback sample PDF for download
        const sampleBase64 = 'JVBERi0xLjQKJeLjz9MKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDMgMCBSL1Jlc291cmNlcyA8PC9Qcm9jU2V0Wy9QREYgL1RleHRdPj4vQ29udGVudHMgNSAwIFI+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggMTAgPj4Kc3RyZWFtCkJUCi9GMSAyNCBUZgoxMCA3MDAgVGYgKCBIZWxsbykgVGoKRVQKZW5kc3RyZWFtCmVuZG9iagoyIDAgb2JqCjw8L1R5cGUvUGFnZXMvQ291bnQgMS9LaWRzIFsgNCAwIFIgXSAvTWVkaWFCb3ggWzAgMCA1OTYgODQxXSA+PgplbmRvYmoKMyAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMiAwIFI+PgplbmRvYmoKc3RhcnR4cmVmCjY2NQolJUVPRgo=';
        const bytes = Uint8Array.from(atob(sampleBase64), c => c.charCodeAt(0));
        const sampleBlob = new Blob([bytes], { type: 'application/pdf' });
        const blobUrl = URL.createObjectURL(sampleBlob);
        const a = document.createElement('a');
        a.href = blobUrl;
        a.download = resource.name;
        document.body.appendChild(a);
        a.click();
        a.remove();
        setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
        alert('Downloaded a sample PDF because the stored file is not a valid PDF. Replace the file in public/resources with a real PDF for correct downloads.');
        return;
      }

      // Normal path: download the fetched blob
      const blobUrl = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = resource.name;
      document.body.appendChild(a);
      a.click();
      a.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 60 * 1000);
    } catch (err) {
      console.warn('Failed to download resource', url, err);
      alert(`Could not download resource: ${err.message}`);
    }
  };

  const handleOpen = (resource) => {
    // Prefer uploaded resource if present (open blob URL in new window)
    const uploaded = getUploadedResource(resource);

    // Open a new blank window synchronously to avoid popup blocking
    const newWin = window.open('', '_blank');
    if (!newWin) {
      alert('Unable to open a new window. Please allow popups for this site.');
      return;
    }

    if (uploaded) {
      const blobUrl = URL.createObjectURL(uploaded.blob);
      newWin.location.href = blobUrl;
      setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch(e){} }, 60 * 1000);
      return;
    }

    const url = getResourceUrl(resource);
    newWin.location.href = url;
  };

  const filteredResources = resources.filter(resource => {
    const matchesSearch = searchQuery === '' || 
      resource.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filter === 'All Types' || 
      resource.type === filter;

    const matchesDepartment = departmentFilter === 'All Departments' || 
      resource.department.includes(departmentFilter);
    
    return matchesSearch && matchesType && matchesDepartment;
  });

  const getActionButton = (action, resource) => {
     // make buttons full width on mobile and auto on larger screens
    // inline-flex + centered ensures consistent vertical alignment across anchors/buttons
    const baseClasses = "inline-flex justify-center items-center text-sm font-medium px-3 py-2 rounded focus:outline-none w-full sm:w-auto text-center";
    const linkClasses = "text-blue-600 hover:text-blue-700 hover:bg-gray-50";

    // Render a real <a> for Open actions so browsers treat it as a genuine navigation
    if (action === 'Open') {
      const uploaded = getUploadedResource(resource);
      if (uploaded) {
        const blobUrl = URL.createObjectURL(uploaded.blob);
        const handleClick = () => {
          // revoke after a bit
          setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 60 * 1000);
        };
        return (
          <a
            key={action}
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`${baseClasses} ${linkClasses}`}
            aria-label={`${action} ${resource.name}`}
          >
            {action}
          </a>
        );
      }

      // external or public resource
      const url = getResourceUrl(resource);
      return (
        <a
          key={action}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${linkClasses}`}
          aria-label={`${action} ${resource.name}`}
        >
          {action}
        </a>
      );
    }

    // Render a real <a> for View actions as well to avoid popup blocking
    if (action === 'View') {
      const uploaded = getUploadedResource(resource);
      if (uploaded) {
        const blobUrl = URL.createObjectURL(uploaded.blob);
        const handleClick = () => {
          setTimeout(() => { try { URL.revokeObjectURL(blobUrl); } catch (e) {} }, 60 * 1000);
        };
        return (
          <a
            key={action}
            href={blobUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleClick}
            className={`${baseClasses} ${linkClasses}`}
            aria-label={`${action} ${resource.name}`}
          >
            {action}
          </a>
        );
      }

      const url = getResourceUrl(resource);
      return (
        <a
          key={action}
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={`${baseClasses} ${linkClasses}`}
          aria-label={`${action} ${resource.name}`}
        >
          {action}
        </a>
      );
    }

    let onClick = null;
    if (action === 'View') onClick = () => handleView(resource);
    if (action === 'Download') onClick = () => handleDownload(resource);

    return (
      <button
        key={action}
        onClick={onClick}
        className={`${baseClasses} ${linkClasses}`}
        aria-label={`${action} ${resource.name}`}
      >
        {action}
      </button>
    );
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'PDF':
        return (
          <span className="bg-red-100 text-red-600 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
          </span>
        );
      case 'Slides':
        return (
          <span className="bg-blue-100 text-blue-600 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </span>
        );
      case 'Link':
        return (
          <span className="bg-purple-100 text-purple-600 p-1 rounded">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
            </svg>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto p-6 w-full">
         {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
            <p className="text-gray-600">All files, links and guides</p>
          </div>

          {/* Controls: two-row layout on mobile to avoid crowding */}
          <div className="w-full sm:w-auto">
            <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
              <div className="relative w-full max-w-md min-w-0">
                <input
                  type="text"
                  placeholder="Search resources..."
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>

              <select
                className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 flex-shrink-0"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option>All Types</option>
                <option>PDF</option>
                <option>Slides</option>
                <option>Link</option>
              </select>
            </div>

            <div className="mt-3 sm:mt-0 flex items-center gap-3">
              <select
                className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option>All Departments</option>
                <option>CS Dept</option>
                <option>IT Dept</option>
              </select>
            </div>
          </div>
        </div>

         {/* Upload helper (stores file in localStorage as base64) */}
         <div className="mb-4">
           <label className="text-sm font-medium text-gray-700 mr-2">Upload resource (for testing):</label>
           <input type="file" onChange={handleFileInput} className="ml-2 mt-2 sm:mt-0" />
         </div>

         {/* Resources List */}
         <div className="space-y-4">
           {filteredResources.map((resource, index) => (
             <div key={index} className="bg-white shadow rounded-lg p-4">
               <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                 <div className="flex items-center space-x-3 min-w-0">
                   {getTypeIcon(resource.type)}
                   <div className="min-w-0">
                     <h3 className="font-medium text-gray-900 break-words">{resource.name}</h3>
                     <p className="text-sm text-gray-500 break-words">
                       {resource.department} • {resource.access}
                     </p>
                   </div>
                 </div>

                 <div className="w-full sm:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                   {resource.actions.map(action => (
                     // On mobile we want buttons side-by-side and evenly spaced; use flex-1 so they share row
                     <div key={action} className="flex-1 sm:flex-none min-w-0">
                       {getActionButton(action, resource)}
                     </div>
                   ))}
                 </div>
               </div>
             </div>
           ))}
         </div>
       </div>
     </div>
   );
 };

 export default Resources;

