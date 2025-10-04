import {
	normalizePhone,
	validateEmail,
	validateGithub,
	validateName,
	validatePhone,
	validateWebsite,
} from "@/utils/validation"
import { useState } from "react"

export const useProfileForm = (profile: Profile | null) => {
	const initialForm = {
		name: profile?.name || "",
		phone: profile?.phone,
		email: profile?.email || "",
		bio: profile?.bio || "",
		website: profile?.website || "",
		github: profile?.github || "",
	}

	const initialErrors = {
		name: "",
		phone: "",
		email: "",
		bio: "",
		website: "",
		github: "",
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
				if (!validateName(value)) err = "Name must be at least 3 characters"
				break
			case "website":
				if (!validateWebsite(value)) err = "Invalid website address"
				break
			case "github":
				if (!validateGithub(value)) err = "Invalid github address"
				break
		}
		setErrors((prev) => ({ ...prev, [field]: err }))
		return err
	}

	const validateAll = () => {
		let allErrors = {}

		for (let key in form) {
			const err = validateField(key, form[key])
			if (err) allErrors[key] = err
		}

		const hasErrors = Object.values(allErrors).some(Boolean)
		setErrors((prev) => ({ ...prev, ...allErrors }))
		return !hasErrors
	}

	return { form, errors, touched, updateField, validateField, validateAll, setTouched }
}
