// bok/js/resources.js

document.addEventListener('DOMContentLoaded', () => {
    const searchInput = document.getElementById('searchInput');
    const searchButton = document.getElementById('searchButton');
    const levelFilter = document.getElementById('levelFilter');
    const categoryFilter = document.getElementById('categoryFilter');
    const resultsContainer = document.getElementById('resultsContainer');
    const treeViewContainer = document.getElementById('treeViewContainer'); // New: Get tree view container
    const resultCount = document.getElementById('resultCount');
    const noResultsMessage = document.getElementById('noResultsMessage');

    let allCompetitions = [];
    const nationalCategories = ['A', 'B', 'C', 'D'];
    const provincialCategories = ['C'];
    let isSearching = false; // New: State to track if search/filter is active

    // Function to fetch competition data
    async function fetchCompetitions() {
        try {
            const response = await fetch('/resources/competitions.json');
            allCompetitions = await response.json();
            populateCategoryFilter(); // Populate category filter based on default level
            renderView(); // Modified: Initial render based on current state
        } catch (error) {
            console.error('Error fetching competitions:', error);
            resultsContainer.innerHTML = '<p style="color: red;">加载竞赛数据失败，请稍后重试。</p>';
            resultCount.textContent = '0';
            noResultsMessage.style.display = 'block';
            resultsContainer.style.display = 'none';
            treeViewContainer.style.display = 'none'; // Hide tree view if fetch fails
        }
    }

    // Function to populate category filter options
    function populateCategoryFilter() {
        const selectedLevel = levelFilter.value;
        categoryFilter.innerHTML = '<option value="">全部类别</option>'; // Reset options
        let categories = [];

        if (selectedLevel === '国家级') {
            categories = nationalCategories;
            categoryFilter.disabled = false;
        } else if (selectedLevel === '省级') {
            categories = provincialCategories;
            categoryFilter.disabled = false;
        } else {
            categoryFilter.disabled = true; // Disable if no level is selected
        }

        categories.forEach(cat => {
            const option = document.createElement('option');
            option.value = cat;
            option.textContent = cat;
            categoryFilter.appendChild(option);
        });
    }

    // New: Function to render the tree view
    function renderTreeView(competitionsToRender) {
        treeViewContainer.innerHTML = ''; // Clear previous results
        resultsContainer.style.display = 'none'; // Hide card view
        treeViewContainer.style.display = 'block'; // Show tree view

        if (competitionsToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            resultCount.textContent = '0';
            return;
        } else {
            noResultsMessage.style.display = 'none';
        }

        // Group by level, then by category
        const groupedByLevel = competitionsToRender.reduce((acc, comp) => {
            if (!acc[comp.level]) {
                acc[comp.level] = {};
            }
            if (!acc[comp.level][comp.category]) {
                acc[comp.level][comp.category] = [];
            }
            acc[comp.level][comp.category].push(comp);
            return acc;
        }, {});

        for (const level in groupedByLevel) {
            const levelNode = document.createElement('div');
            levelNode.className = 'tree-node level-1';
            levelNode.innerHTML = `
                <div class="tree-node-header">
                    <span class="tree-toggle">▶</span> ${level}
                </div>
                <div class="tree-content"></div>
            `;
            const levelContent = levelNode.querySelector('.tree-content');

            for (const category in groupedByLevel[level]) {
                const categoryNode = document.createElement('div');
                categoryNode.className = 'tree-node level-2';
                categoryNode.innerHTML = `
                    <div class="tree-node-header">
                        <span class="tree-toggle">▶</span> ${category}
                    </div>
                    <div class="tree-content"></div>
                `;
                const categoryContent = categoryNode.querySelector('.tree-content');

                groupedByLevel[level][category].forEach(comp => {
                    const compNode = document.createElement('div');
                    compNode.className = 'tree-node level-3';
                    compNode.innerHTML = `
                        <p>${comp.name}</p>
                        ${comp.remark ? `<p>备注: ${comp.remark}</p>` : ''}
                    `;
                    categoryContent.appendChild(compNode);
                });
                levelContent.appendChild(categoryNode);
            }
            treeViewContainer.appendChild(levelNode);
        }

        // Add event listeners for toggling
        treeViewContainer.querySelectorAll('.tree-node-header').forEach(header => {
            header.addEventListener('click', (event) => {
                const toggle = header.querySelector('.tree-toggle');
                const content = header.nextElementSibling; // The .tree-content div
                if (content) {
                    const isExpanded = content.style.display === 'block';
                    content.style.display = isExpanded ? 'none' : 'block';
                    toggle.classList.toggle('expanded', !isExpanded);
                    toggle.textContent = isExpanded ? '▶' : '▼';
                }
            });
        });
        resultCount.textContent = competitionsToRender.length;
    }

    // Modified: Function to render competitions (card view)
    function renderCardView(competitionsToRender) {
        resultsContainer.innerHTML = ''; // Clear previous results
        treeViewContainer.style.display = 'none'; // Hide tree view
        resultsContainer.style.display = 'grid'; // Show card view
        
        if (competitionsToRender.length === 0) {
            noResultsMessage.style.display = 'block';
            resultsContainer.style.display = 'none';
        } else {
            noResultsMessage.style.display = 'none';
            competitionsToRender.forEach(comp => {
                const card = document.createElement('div');
                card.className = 'card resource-item';
                card.innerHTML = `
                    <h3>${comp.name}</h3>
                    <p><strong>级别:</strong> ${comp.level}</p>
                    <p><strong>类别:</strong> ${comp.category}</p>
                    ${comp.remark ? `<p><strong>备注:</strong> ${comp.remark}</p>` : ''}
                `;
                resultsContainer.appendChild(card);
            });
        }
        resultCount.textContent = competitionsToRender.length;
    }

    // New: Function to decide which view to render
    function renderView(filteredCompetitions = allCompetitions) {
        if (isSearching) {
            renderCardView(filteredCompetitions);
        } else {
            renderTreeView(filteredCompetitions);
        }
    }

    // Function to filter competitions
    function filterCompetitions() {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const selectedLevel = levelFilter.value;
        const selectedCategory = categoryFilter.value;

        // Determine if any search/filter criteria are active
        isSearching = searchTerm !== '' || selectedLevel !== '' || selectedCategory !== '';

        const filtered = allCompetitions.filter(comp => {
            const matchesSearch = comp.name.toLowerCase().includes(searchTerm);
            const matchesLevel = selectedLevel === '' || comp.level === selectedLevel;
            const matchesCategory = selectedCategory === '' || comp.category === selectedCategory;
            
            return matchesSearch && matchesLevel && matchesCategory;
        });

        renderView(filtered); // Modified: Render based on isSearching state
    }

    // Event listeners
    searchButton.addEventListener('click', filterCompetitions);
    searchInput.addEventListener('keyup', (event) => {
        if (event.key === 'Enter') {
            filterCompetitions();
        } else {
            // New: If user types, update isSearching state and re-render
            isSearching = searchInput.value.toLowerCase().trim() !== '' || levelFilter.value !== '' || categoryFilter.value !== '';
            filterCompetitions(); // Re-filter and render
        }
    });
    levelFilter.addEventListener('change', () => {
        populateCategoryFilter();
        isSearching = searchInput.value.toLowerCase().trim() !== '' || levelFilter.value !== '' || categoryFilter.value !== '';
        filterCompetitions(); // Re-filter when level changes
    });
    categoryFilter.addEventListener('change', () => {
        isSearching = searchInput.value.toLowerCase().trim() !== '' || levelFilter.value !== '' || categoryFilter.value !== '';
        filterCompetitions(); // Re-filter when category changes
    });

    // Initialize
    fetchCompetitions();
});
