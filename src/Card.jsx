import "./Card.css"

function Card({ id, name, image, types }) {
    const idFormatted = id ? `#${String(id).padStart(3, "0")}` : ""

    return (
        <div className="card">
            <div className="card-img">
                <img src={image} alt={name} />
            </div>
            <p className="card-id">{idFormatted}</p>
            <h2 className="card-name">
                {name ? name.charAt(0).toUpperCase() + name.slice(1) : ""}
            </h2>
            <div className="card-types">
                {types && types.map((t, idx) => (
                    <div key={idx} className={`type-pill ${t.type.name}-type`}>
                        {t.type.name.toUpperCase()}
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Card