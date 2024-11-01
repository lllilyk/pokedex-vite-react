import React from 'react';

const Bookmark = ({ bookmarkedPokemon, toggleBookmark }) => {
    return (
        <div>
            <h3>북마크된 포켓몬</h3>
            <ul>
                {bookmarkedPokemon.map((p, index) => (
                    <li key={index}>
                        {p.koreanName} ({p.name})
                        <button onClick={() => toggleBookmark(p)}>북마크 제거</button>
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Bookmark;
