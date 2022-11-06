const CreateEvent = () => {
    return (
        <div className="create-event">
            <h2 className="new-event-header">New Event</h2>
            <form>
                <div className="input-wrap">
                    <input type="text" placeholder="Event Name" />
                </div>
                <div className="input-wrap">
                    <textarea placeholder="Event Description(eg. The beach party of the summer with all the coolest celebs...)" />
                </div>
            </form>
        </div>
    )
}

export default CreateEvent
