import Vue from 'https://unpkg.com/vue@2.6.12/dist/vue.esm.browser.js'; // Importamos Vue
import { Project, TimedTask } from './class.js'; // Importamos las clases

new Vue({ // Creamos una nueva instancia de Vue
    el: '#app',
    data: {
        loggedIn: false,
        username: '',
        password: '',
        loginError: '',
        users: {
            Gerard: '123456789',
            Wellington: '123456789'
        },
        projects: [], // Para almacenar los proyectos
        newProjectName: '',
        newProjectDueDate: '',
        newTaskName: '',
        currentProject: null,
        editingProjectIndex: null,
        editingTaskIndex: null,
        tempProject: {}, // Para almacenar temporalmente el proyecto que se está editando
        projectStatusCounts: {
            completed: 0,
            overdue: 0,
            dueSoon: 0,
            onTrack: 0
        } // Para almacenar el resumen de los estados de los proyectos
    },
    computed: { // Propiedades computadas
        sortedProjects() {
            return this.projects.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)); // ordenar por fecha de vencimiento
        }
    },
    methods: { // Métodos
        login() { // Método para iniciar sesión
            const username = this.username.trim().toLowerCase();
            const validUser = Object.keys(this.users).find(user => user.toLowerCase() === username);
            if (validUser && this.users[validUser] === this.password) {
                this.loggedIn = true;
                this.loginError = '';
                this.updateProjectStatusCounts(); // Actualizar el resumen de estados al iniciar sesión
            } else {
                this.loginError = 'Invalid username or password';
            }
        },
        createProject() { // Método para crear un proyecto
            if (!this.newProjectName.trim() || !this.newProjectDueDate.trim()) {
                alert('Please enter a project name and due date.');
                return;
            }
            const dueDate = new Date(this.newProjectDueDate);
            this.currentProject = new Project(this.newProjectName, dueDate);
            this.newProjectName = '';
            this.newProjectDueDate = '';
        },
        addTask() { // Método para añadir una tarea
            if (!this.newTaskName.trim()) {
                alert('Please enter a task name.');
                return;
            }
            const task = new TimedTask(this.newTaskName);
            this.currentProject.addTask(task);
            this.newTaskName = ''; // Asegura que el campo esté vacío después de añadir una tarea
        },
        confirmProject() { // Método para confirmar un proyecto 
            if (this.currentProject.tasks.length === 0) {
                alert('Debe añadir al menos una tarea.');
                return;
            }
            this.currentProject.confirmed = true;
            this.projects.push(this.currentProject);
            this.currentProject = null;
            this.updateProjectStatusCounts(); // Actualizar el resumen de estados después de confirmar un proyecto
        },
        editProject(projectIndex) { // Método para editar un proyecto
            this.editingProjectIndex = projectIndex;
            this.tempProject = JSON.parse(JSON.stringify(this.projects[projectIndex])); // Crear una copia profunda del proyecto
            this.editingTaskIndex = null;
        },
        saveChanges(projectIndex) {
            if (this.tempProject) {
                // Aplicar los cambios del proyecto temporal al original
                Vue.set(this.projects, projectIndex, JSON.parse(JSON.stringify(this.tempProject)));
                this.tempProject = null;
            }
            this.editingProjectIndex = null;
            this.editingTaskIndex = null;
            this.$forceUpdate(); // Forzar la actualización de la interfaz
            this.updateProjectStatusCounts(); // Actualizar el resumen de estados después de guardar cambios
        },
        cancelChanges() { // Método para cancelar los cambios
            this.editingProjectIndex = null; 
            this.tempProject = null; // Descartar los cambios
        },
        editTask(projectIndex, taskIndex) { // Método para editar una tarea
            this.editingTaskIndex = taskIndex;
        },
        saveTaskChanges(projectIndex, taskIndex) { // Método para guardar los cambios de una tarea
            this.editingTaskIndex = null;
            this.$forceUpdate(); // Forzar la actualización de la interfaz
        },
        deleteTask(projectIndex, taskIndex) { //    Método para eliminar una tarea
            this.projects[projectIndex].deleteTask(taskIndex);
            this.updateProjectStatusCounts(); // Actualizar el resumen de estados después de eliminar una tarea
        },
        deleteProject(projectIndex) { // Método para eliminar un proyecto
            this.projects.splice(projectIndex, 1);
            this.updateProjectStatusCounts(); // Actualizar el resumen de estados después de eliminar un proyecto
        },
        toggleProjectCompletion(projectIndex) { // Método para cambiar el estado de un proyecto
            const project = this.projects[projectIndex];
            project.completed = !project.completed;
            project.tasks.forEach(task => task.completed = project.completed);
            this.updateProjectStatusCounts(); // Actualizar el resumen de estados después de cambiar el estado de un proyecto
        },
        toggleTaskCompletion(projectIndex, taskIndex) { // Método para cambiar el estado de una tarea
            const task = this.projects[projectIndex].tasks[taskIndex];
            task.completed = !task.completed;
        },
        projectStatus(project) { // Método para obtener el estado de un proyecto
            const currentDate = new Date();
            const dueDate = new Date(project.dueDate);
            if (project.completed) {
                return 'completed';
            } else if (dueDate < currentDate) {
                return 'overdue';
            } else if ((dueDate - currentDate) / (1000 * 60 * 60 * 24) <= 7) {
                return 'due-soon';
            } else {
                return 'on-track';
            }
        },
        formatDueDate(date) { // Método para formatear la fecha de vencimiento
            const options = {
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit', second: '2-digit'
            };
            return new Date(date).toLocaleDateString('es-ES', options).replace(',', '');
        },
        updateProjectStatusCounts() { // Método para actualizar el resumen de estados
            this.projectStatusCounts = Project.getProjectStatusCounts(this.projects);
        }
    },
    mounted() {
        this.updateProjectStatusCounts(); // Actualizar el resumen de estados al montar el componente
    }
});
