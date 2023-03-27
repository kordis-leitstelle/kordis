# Kordis Landscape

The following diagram shows the high-level architecture components that Kordis
is built on.

![kordis landscape diagram](https://user-images.githubusercontent.com/13659466/226492980-53d7c18f-87b5-401b-8fc8-5384e369d525.png)

[1]: Frontend _SPA_ being served with Azure SWA.<br> [2]: User-Auth Flow managed
by Azure AD.<br> [3]: Backend _API_ being served with Azure Web Apps (App
Services).<br> [4]: Token Storage/ User Management.<br> [5]: Frontend connects
to MapTiler for Vector Maps and Cartesius for Geocoding Services.<br> [6]:
Backend connects to Database and further services such as Azure Maps and
Cartesius.<br> [7]: Backend also consumes 3rd Party Services such as the
[NINA API](https://nina.api.bund.dev/).<br>
