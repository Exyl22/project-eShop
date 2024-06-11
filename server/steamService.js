import axios from 'axios';

export const getSteamGameDetails = async (appId) => {
    try {
        const response = await axios.get(`https://store.steampowered.com/api/appdetails?appids=${appId}&cc=EU&l=russian`);
        console.log('Steam API Response:', response.data);
        if (response.data[appId].success) {
            const gameData = response.data[appId].data;
            const pcRequirements = {
                minimum: gameData.pc_requirements.minimum || 'No minimum requirements provided',
                recommended: gameData.pc_requirements.recommended || 'No recommended requirements provided',
            };
            const steamDetails = {
                name: gameData.name || 'No name provided',
                description: gameData.detailed_description || 'No description provided', 
                short_description: gameData.short_description || 'No description provided', 
                base_price: gameData.price_overview ? gameData.price_overview.initial / 100 : null,
                price: gameData.price_overview ? gameData.price_overview.final / 100 : null,
                image: gameData.header_image || '',
                library_image: `https://steamcdn-a.akamaihd.net/steam/apps/${appId}/library_600x900.jpg`, // Adding URL for the specific format
                tags: gameData.genres ? gameData.genres.map(genre => genre.description) : [],
                pc_requirements: pcRequirements,
                recommendations_total: gameData.recommendations?.total || 0,
                recommendations_positive: gameData.recommendations?.total_positive || 0,
                images: gameData.screenshots ? gameData.screenshots.map(screenshot => screenshot.path_thumbnail) : [], 
                header_image: gameData.header_image || '', // Ensure this is returned
            };

            return steamDetails;
        } else {
            console.error('Steam API response indicates failure for appId:', appId);
            return null;
        }
    } catch (error) {
        console.error('Error fetching game details from Steam:', error);
        throw new Error('Failed to fetch game details from Steam');
    }
};
