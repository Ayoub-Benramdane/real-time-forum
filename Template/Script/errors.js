export function showError(error, message) {
    if (message) {
        const mainContainer = document.querySelector('main') || document.body;
        mainContainer.innerHTML = `
                <div class="container">
                    <img src="https://media.istockphoto.com/id/155384933/photo/computer-showing-an-error-message.jpg?s=612x612&w=0&k=20&c=sNTu9BAo58HO2FNIjsEsnMf5_dtKfOIUhPccW4u6itg="
                        width="100%">
                    <center>
                        <h1 class="error-message">${message}</h1>
                        <h1 class="error-message">${error}</h1>
                    </center>
                </div>
            `;
    } else {
        const mainContainer = document.querySelector('main') || document.body;
        if (error) {
            error = JSON.parse(error)
        }    
        console.log(error);
        mainContainer.innerHTML = `
                <div class="container">
                    <img src="https://media.istockphoto.com/id/155384933/photo/computer-showing-an-error-message.jpg?s=612x612&w=0&k=20&c=sNTu9BAo58HO2FNIjsEsnMf5_dtKfOIUhPccW4u6itg="
                        width="100%">
                    <center>
                        <h1 class="error-message">${error["message"]}</h1>
                        <h1 class="error-message">${error["code"]}</h1>
                    </center>
                </div>
            `;
    }
}