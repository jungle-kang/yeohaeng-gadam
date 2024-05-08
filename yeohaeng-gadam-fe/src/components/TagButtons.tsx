// TagButtons.jsx
const TagButtons = ({ tags, activeTags, onTagClick }) => {
    return (
        <div>
            {tags.map(tag => (
                <button key={tag.id}
                    className={activeTags.includes(tag.name) ? "bg-blue-300" : "bg-blue-100"}
                    onClick={() => onTagClick(tag.name)}>
                    {tag.name}
                </button>
            ))}
        </div>
    );
};

export default TagButtons;
