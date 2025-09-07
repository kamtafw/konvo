import {
	normalizePhone,
	validateEmail,
	validateName,
	validatePassword,
	validatePhone,
} from "@/utils/validation"
import { useState } from "react"

export const useAccountForm = (isSignup: boolean) => {
	const initialForm = {
		phone: "",
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		secureText: null,
	}
	const initialErrors = {
		phone: "",
		name: "",
		email: "",
		password: "",
		confirmPassword: "",
		form: "",
	}

	const [form, setForm] = useState(initialForm)
	const [errors, setErrors] = useState(initialErrors)
	const [touched, setTouched] = useState({})

	const updateField = (field: any, value: any) => {
		setForm((prev) => ({ ...prev, [field]: value }))
		setErrors((prev) => ({ ...prev, [field]: "" }))
	}

	const validateField = (field: string, value: any) => {
		let err = ""
		switch (field) {
			case "phone":
				if (!validatePhone(normalizePhone(value))) err = "Invalid phone number"
				break
			case "email":
				if (!validateEmail(value)) err = "Invalid email address"
				break
			case "name":
				if (!validateName(value)) err = "Name must be at least 4 characters"
				break
			case "password":
				if (!validatePassword(value)) err = "Password must be at least 8 characters"
				break
			case "confirmPassword":
				if (value !== form.password) err = "Passwords do not match"
				break
		}
		setErrors((prev) => ({ ...prev, [field]: err }))
		return err
	}

	const validateAll = () => {
		let allErrors = {}
		for (let key in form) {
			if (!isSignup && !["phone", "password"].includes(key)) continue
			const err = validateField(key, form[key])
			if (err) allErrors[key] = err
		}
		const hasErrors = Object.values(allErrors).some(Boolean)
		setErrors((prev) => ({ ...prev, ...allErrors }))
		return !hasErrors
	}

	const reset = () => {
		setForm(initialForm)
		setErrors(initialErrors)
		setTouched({})
	}

	return {
		form,
		errors,
		touched,
		updateField,
		validateField,
		validateAll,
		setTouched,
		reset,
	}
}
