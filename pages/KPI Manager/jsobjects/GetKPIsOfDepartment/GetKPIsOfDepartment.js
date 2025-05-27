export default {
	GetData()
	{
		if (appsmith.store.Selected_Department == null) storeValue("Selected_Department", 1);
		GetDepartmentKPIs.run();
	}
}