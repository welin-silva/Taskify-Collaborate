export class Task { 
    constructor(description, dueDate = new Date()) { // Constructor de la clase Task
        this.description = description; 
        this.completed = false; 
        this.dueDate = dueDate;
        this.status = 'not-started';
    }

    complete() { // Método para marcar una tarea como completada
        this.completed = true;
    }

    showDescription() { // Método para mostrar la descripción de una tarea en la consola
        return this.description;
    }

    formatDueDate() { // Método para formatear la fecha de vencimiento de una tarea
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        return this.dueDate.toLocaleDateString('es-ES', options).replace(',', '');  // Formatear la fecha de vencimiento
    }
}

export class TimedTask extends Task {
    constructor(description, dueDate = new Date()) { // Constructor de la clase TimedTask
        super(description, dueDate);
    }
}

export class Project { // Clase Project para gestionar proyectos
    constructor(name, dueDate = new Date()) {
        this.name = name;
        this.tasks = [];
        this.confirmed = false;
        this.dueDate = dueDate;
        this.completed = false;
    }

    addTask(task) {  // Método para añadir una tarea a un proyecto
        this.tasks.push(task); 
    }

    deleteTask(index) { // Método para eliminar una tarea de un proyecto
        if (index >= 0 && index < this.tasks.length) {
            this.tasks.splice(index, 1);
        }
    }

    compareDueDate() { // Método para comparar la fecha de vencimiento de un proyecto
        const now = new Date();
        const timeDiff = this.dueDate - now;
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        const twoWeeks = 2 * 7 * 24 * 60 * 60 * 1000;
        const threeWeeks = 3 * 7 * 24 * 60 * 60 * 1000;

        if (timeDiff <= oneWeek) {
            return 'red';
        } else if (timeDiff <= twoWeeks) {
            return 'orange';
        } else if (timeDiff <= threeWeeks) {
            return 'yellow';
        } else {
            return 'green';
        }
    }

    formatDueDate() { // Método para formatear la fecha de vencimiento de un proyecto
        const options = {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit'
        };
        return this.dueDate.toLocaleDateString('es-ES', options).replace(',', '');
    }

    // Método estático para obtener un resumen del estado de los proyectos
    static getProjectStatusCounts(projects) {
        const counts = { // Inicializar los contadores de estados
            completed: 0,
            overdue: 0,
            dueSoon: 0,
            onTrack: 0
        };
        
        const currentDate = new Date(); // Obtener la fecha actual

        projects.forEach(project => { // Iterar sobre los proyectos para contar los estados de cada uno de ellos 
            const dueDate = new Date(project.dueDate); // Obtener la fecha de vencimiento del proyecto
            if (project.completed) { // Comprobar si el proyecto está completado
                counts.completed++; // Incrementar el contador de proyectos completados
            } else if (dueDate < currentDate) { // Comprobar si el proyecto está vencido
                counts.overdue++;   // Incrementar el contador de proyectos vencidos
            } else if ((dueDate - currentDate) / (1000 * 60 * 60 * 24) <= 7) {  // Comprobar si el proyecto está próximo a vencer
                counts.dueSoon++;  // Incrementar el contador de proyectos próximos a vencer
            } else {    // Si no se cumple ninguna de las condiciones anteriores, el proyecto está en curso
                counts.onTrack++; // Incrementar el contador de proyectos en curso
            }
        });

        return counts; // Devolver el resumen de estados
    }
}
