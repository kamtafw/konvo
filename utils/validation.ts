export const normalizePhone = (phone: string) => {
	const phoneNumber = String(phone).trim()

	return ["080", "081", "070", "090", "091"].some((start) => phoneNumber.startsWith(start))
		? "+234" + phoneNumber.slice(1)
		: phoneNumber.startsWith("234")
			? "+" + phoneNumber
			: phoneNumber
}

export const validateEmail = (email: string) => {
	if (!email) return true
	return String(email)
		.toLowerCase()
		.match(
			/^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
		)
}

export const validatePassword = (password: string) => {
	if (!password) return true
	return String(password).length >= 8
}

export const validatePhone = (phone: string) => {
	if (!phone) return true
	const normalized = normalizePhone(phone)
	return (
		/^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s\./0-9]*$/i.test(normalized) && normalized.length === 14
	)
}

export const validateName = (name: string) => {
	if (!name) return true
	return String(name).length >= 4
}
