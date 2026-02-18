/**
 * CharacterGrid — Layout manager for 5 character cards with staggered rise animation
 */
import { motion, AnimatePresence } from 'framer-motion';
import useGameStore from '../../store/gameState';
import CHARACTERS from '../../data/characters';
import CharacterCard from './CharacterCard';

function CharacterGrid() {
    const selectedCharacter = useGameStore((s) => s.selectedCharacter);
    const setSelectedCharacter = useGameStore((s) => s.setSelectedCharacter);

    return (
        <div className="character-grid">
            {CHARACTERS.map((char) => (
                <CharacterCard
                    key={char.id}
                    character={char}
                    isSelected={selectedCharacter === char.index}
                    onSelect={setSelectedCharacter}
                />
            ))}
        </div>
    );
}

export default CharacterGrid;
