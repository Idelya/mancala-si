import "./Modal.css"
export function Modal({ title = '', content, confirmFun, confirmText }) {
    return (
    <div className="modal_backdrop">
        <div className="modal_box">
            <h2>{title}</h2>
            <div>{content}</div>
            <div>
                <button onClick={confirmFun}>{confirmText}</button>
            </div>
        </div>
    </div>
    );
  }