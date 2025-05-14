/**
 * Genera una fecha en formato 'dd-mm-yyyy'. El formato puede cambiar en el futuro si es necesario.
 * @returns La fecha actual en formato 'dd-mm-yyyy'.
 */
export function generateDate(): string {
    const date = new Date();
    let day = date.getDate();
    let month = date.getMonth() + 1;
    let year = date.getFullYear();
    let generateDate: string;

    // Formatea el día y el mes con ceros a la izquierda si es necesario.
    if (month < 10 && day < 10) {
        generateDate = `0${day}-0${month}-${year}`;
    } else if (month < 10) {
        generateDate = `${day}-0${month}-${year}`;
    } else if (day < 10) {
        generateDate = `0${day}-${month}-${year}`;
    } else {
        generateDate = `${day}-${month}-${year}`;
    }

    return generateDate;
}
