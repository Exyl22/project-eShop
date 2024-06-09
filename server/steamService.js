// steamService.js
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
                description: gameData.detailed_description || 'No description provided',
                images: gameData.screenshots ? gameData.screenshots.map(screenshot => screenshot.path_full) : [],
                headerImage: gameData.header_image || '',
                tags: gameData.genres ? gameData.genres.map(genre => genre.description) : [],
                recommendations_total: gameData.recommendations?.total || 0,
                recommendations_positive: gameData.recommendations?.total_positive || 0,
            };

            return { ...steamDetails, pc_requirements: pcRequirements };
        } else {
            console.error('Steam API response indicates failure for appId:', appId); 
            return null;
        }
    } catch (error) {
        console.error('Error fetching game details from Steam:', error);
        return null;
    }
};
