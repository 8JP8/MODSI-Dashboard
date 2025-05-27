export default {
	convert(input) {
		const roleTranslation = {
			"System Administrator": "Administrador do Sistema",
			"Production Manager": "Gestor de Produção",
			"Finance Director": "Diretor Financeiro",
			"Supply Chain Manager": "Gestor da Cadeia de Suprimentos",
			"Sales Director": "Diretor de Vendas",
			"Quality Manager": "Gestor de Qualidade",
			"HR Manager": "Gestor de Recursos Humanos",
			"Plant Manager": "Gestor de Fábrica",
			"Financial Analyst": "Analista Financeiro",
			"Logistics Coordinator": "Coordenador de Logística",
			"Sales Representative": "Representante de Vendas",
			"Quality Inspector": "Inspetor de Qualidade",
			"HR Specialist": "Especialista em Recursos Humanos",
			"Line Supervisor": "Supervisor de Linha",
			"CEO": "Diretor Executivo",
			"CFO": "Diretor Financeiro",
			"CTO": "Diretor de Tecnologia",
			"COO": "Diretor de Operações",
			"VP of Sales": "VP de Vendas",
			"VP of Human Resources": "VP de Recursos Humanos",
			"User": "Utilizador"
		};

		return input.map(role => ({
			label: roleTranslation[role.Name] || role.Name,
			value: role.Name
		}));
	}
}