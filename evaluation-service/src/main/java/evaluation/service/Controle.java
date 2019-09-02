package evaluation.service;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import com.google.gson.JsonObject;

@Controller
public class Controle {

	@GetMapping("/atividade")
	public String atividade(Model model) {
		return "atividade";
	}
	
	@GetMapping("/poc")
	public String verAtividadePoc(Model model) {
		return "poc";
	}
	
	@RequestMapping(value = "/user", method = RequestMethod.GET)
	@ResponseBody
	public Authentication getUser() {
		Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
		
		return authentication;
	}
	
	@RequestMapping(value = "/genero", method = RequestMethod.GET)
	@ResponseBody
	public Object getGenero() {
		
		JsonObject j = new JsonObject();
		j.addProperty("genero", "homem");
		return j.toString();
	}
}
