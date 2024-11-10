import React from 'react';
import { Link } from 'react-router-dom';

const Bookmark = ({ bookmarkedPokemon, toggleBookmark }) => {
    return (
        <div>
            <h3>북마크된 포켓몬</h3>
            <ul>
                {bookmarkedPokemon.map(p => (
                    <li key={p.id}>
                        <Link to={`/pokemon/${p.id}`}>#{p.id}. {p.koreanName} ({p.name})</Link>
                        <button onClick={() => toggleBookmark(p)}>북마크 제거</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Bookmark;
