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
      actions: ['Open']
    }
  ]);

  const [filter, setFilter] = useState('All Types');

  const [departmentFilter, setDepartmentFilter] = useState('All Departments');
  const [searchQuery, setSearchQuery] = useState('');

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
    const baseClasses = "text-sm font-medium";
    const linkClasses = "text-blue-600 hover:text-blue-700";

    return (
      <button key={action} className={`${baseClasses} ${linkClasses}`}>
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
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Resources</h1>
            <p className="text-gray-600">All files, links and guides</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="text"
                placeholder="Search resources..."
                className="w-64 pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <svg className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>

            <select
              className="border rounded-lg px-4 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            >
              <option>All Types</option>
              <option>PDF</option>
              <option>Slides</option>
              <option>Link</option>
            </select>

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

        {/* Resources List */}
        <div className="space-y-4">
          {filteredResources.map((resource, index) => (
            <div key={index} className="bg-white shadow rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {getTypeIcon(resource.type)}
                  <div>
                    <h3 className="font-medium text-gray-900">{resource.name}</h3>
                    <p className="text-sm text-gray-500">
                      {resource.department} • {resource.access}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {resource.actions.map(action => getActionButton(action, resource))}
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
