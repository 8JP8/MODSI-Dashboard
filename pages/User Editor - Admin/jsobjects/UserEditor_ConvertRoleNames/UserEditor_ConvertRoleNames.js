export default {
	convert(input) {
		const roleTranslation = {
			"CEO": "Diretor Executivo",
			"CFO": "Diretor Financeiro",
			"CTO": "Diretor de Tecnologia",
			"COO": "Diretor de Operações",
			"CMO": "Diretor de Marketing",
			"CIO": "Diretor de Informação",
			"CHRO": "Diretor de Recursos Humanos",
			"Manager": "Gestor",
			"Project Manager": "Gestor de Projetos",
			"Product Manager": "Gestor de Produto",
			"Operations Manager": "Gestor de Operações",
			"Sales Manager": "Gestor de Vendas",
			"Accountant": "Contabilista",
			"Financial Analyst": "Analista Financeiro",
			"HR": "Recursos Humanos",
			"Recruiter": "Recrutador",
			"Logistics": "Logística",
			"Logistics Coordinator": "Coordenador de Logística",
			"Production": "Produção",
			"Production Supervisor": "Supervisor de Produção",
			"Marketing": "Marketing",
			"Digital Marketing Specialist": "Especialista em Marketing Digital",
			"Software Engineer": "Engenheiro de Software",
			"Developer": "Desenvolvedor",
			"IT Support": "Suporte de TI",
			"Data Analyst": "Analista de Dados",
			"Customer Support": "Apoio ao Cliente",
			"Sales Representative": "Representante de Vendas",
			"Administrative Assistant": "Assistente Administrativo",
			"User": "Utilizador"
		};

		return input.map(role => ({
			Name: roleTranslation[role.Name] || role.Name,
			Value: role.Name
		}));
	}
}